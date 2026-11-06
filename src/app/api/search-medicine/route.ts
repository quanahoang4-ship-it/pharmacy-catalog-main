import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json([]);

  const API_KEY = process.env.SERPER_API_KEY;

  try {
    const res = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query }),
    });

    const data = await res.json();

    // Nếu Serper bắt được dữ liệu ảnh
    if (data.images && data.images.length > 0) {
      // Cắt lấy 4 ảnh đầu tiên để hiển thị cho nhẹ web
      const results = data.images.slice(0, 4).map((item: any) => ({
        title: item.title,
        image: item.imageUrl,
      }));
      return NextResponse.json(results);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("--> LỖI KẾT NỐI SERPER:", error);
    return NextResponse.json({ error: "Lỗi tìm kiếm" }, { status: 500 });
  }
}
