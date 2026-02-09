import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

/**
 * GET /api/contract-positions/session-control
 *  - Trả về danh sách các cấu hình điều khiển phiên đang active (required = true), theo thứ tự áp dụng.
 *
 * POST /api/contract-positions/session-control
 *  Body: { final: 'WIN' | 'LOSS', required?: boolean, mode?: 'reset' | 'append' }
 *  - mode = 'reset' (mặc định): xoá hàng đợi cũ, tạo mới 1 phiên (dùng cho nút 100% WIN/LOSS).
 *  - mode = 'append': giữ hàng đợi cũ, thêm 1 phiên mới vào cuối (dùng cho cấu hình nhiều ván).
 */

export const GET: APIRoute = async () => {
  try {
    const configs = await prisma.contractSessionControl.findMany({
      where: { required: true },
      orderBy: { createdAt: 'asc' },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: configs,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error fetching session control config:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch session control config',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const final = body.final as string | undefined;
    const required =
      typeof body.required === 'boolean' ? (body.required as boolean) : true;
    const mode = (body.mode as 'reset' | 'append' | undefined) || 'reset';

    if (!final || (final !== 'WIN' && final !== 'LOSS')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Field 'final' is required and must be 'WIN' or 'LOSS'",
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const activeQueue = await prisma.$transaction(async (tx) => {
      // Nếu mode = reset: deactivate tất cả control đang active
      if (mode === 'reset') {
        await tx.contractSessionControl.updateMany({
          where: { required: true },
          data: { required: false },
        });
      }

      // Tạo control mới (phiên mới)
      await tx.contractSessionControl.create({
        data: {
          final,
          required,
        },
      });

      // Trả về toàn bộ hàng đợi hiện tại (các phiên còn required = true)
      const configs = await tx.contractSessionControl.findMany({
        where: { required: true },
        orderBy: { createdAt: 'asc' },
      });

      return configs;
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: activeQueue,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error creating session control config:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create session control config',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

