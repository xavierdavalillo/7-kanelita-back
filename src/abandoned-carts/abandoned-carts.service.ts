import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAbandonedCartDto } from "./dto/create-abandoned-cart.dto";

const allowedStatuses = new Set(["open", "contacted", "order_sent", "discarded"]);

@Injectable()
export class AbandonedCartsService {
  constructor(private readonly prisma: PrismaService) {}

  async save(createAbandonedCartDto: CreateAbandonedCartDto) {
    const data = this.normalizeCartInput(createAbandonedCartDto);

    return this.prisma.abandonedCart.upsert({
      where: { cartToken: data.cartToken },
      update: {
        ...data,
        status: "open",
        contactedAt: null,
        orderSentAt: null,
        discardedAt: null,
        lastActivityAt: new Date(),
      },
      create: {
        ...data,
        status: "open",
        lastActivityAt: new Date(),
      },
    });
  }

  findAdmin(status?: string) {
    const normalizedStatus = status?.trim();

    if (normalizedStatus && !allowedStatuses.has(normalizedStatus)) {
      throw new BadRequestException("Invalid abandoned cart status.");
    }

    return this.prisma.abandonedCart.findMany({
      where: normalizedStatus ? { status: normalizedStatus } : undefined,
      orderBy: [{ lastActivityAt: "desc" }, { id: "desc" }],
    });
  }

  async markOrderSent(id: number) {
    try {
      return await this.prisma.abandonedCart.update({
        where: { id },
        data: {
          status: "order_sent",
          orderSentAt: new Date(),
        },
      });
    } catch (error) {
      this.handleNotFound(error, id);
    }
  }

  async updateStatus(id: number, status: "open" | "contacted" | "discarded") {
    const now = new Date();

    try {
      return await this.prisma.abandonedCart.update({
        where: { id },
        data: {
          status,
          contactedAt: status === "contacted" ? now : null,
          discardedAt: status === "discarded" ? now : null,
          orderSentAt: null,
        },
      });
    } catch (error) {
      this.handleNotFound(error, id);
    }
  }

  private normalizeCartInput(input: CreateAbandonedCartDto) {
    const customerName = input.customerName.trim();
    const customerWhatsapp = input.customerWhatsapp.replace(/[^\d+]/g, "").trim();
    const customerEmail = input.customerEmail?.trim().toLowerCase() || null;
    const deliveryType = input.deliveryType.trim();
    const cartToken = input.cartToken.trim();

    if (!cartToken) {
      throw new BadRequestException("Cart token is required.");
    }

    if (!customerName) {
      throw new BadRequestException("Customer name is required.");
    }

    if (customerWhatsapp.length < 7) {
      throw new BadRequestException("Customer WhatsApp is required.");
    }

    if (!input.consentToContact) {
      throw new BadRequestException("Contact consent is required.");
    }

    const items = input.items.map((item) => ({
      productId: item.productId,
      title: item.title.trim(),
      selectedSize: item.selectedSize.trim(),
      quantity: item.quantity,
      priceCents: item.priceCents,
      currency: item.currency.trim().toUpperCase() || "USD",
    }));

    const totalCents = items.reduce(
      (total, item) => total + item.priceCents * item.quantity,
      0,
    );

    return {
      cartToken,
      customerName,
      customerWhatsapp,
      customerEmail,
      deliveryType,
      consentToContact: true,
      items,
      totalCents,
      currency: items[0]?.currency ?? "USD",
    };
  }

  private handleNotFound(error: unknown, id: number): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundException(`Abandoned cart ${id} was not found.`);
    }

    throw error;
  }
}
