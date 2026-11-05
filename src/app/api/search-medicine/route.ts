import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json([]);

  // Lấy mã khóa từ file môi trường
  const API_KEY = process.env.GOOGLE_API_KEY;
  const CX = process.env.GOOGLE_CX;

  try {
    // Gửi yêu cầu lên thẳng máy chủ Google yêu cầu tìm kiếm Hình Ảnh
    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&searchType=image&key=${API_KEY}&cx=${CX}&num=4`,
    );

    const data = await res.json();

    // Nếu Google trả về kết quả
    if (data.items) {
      const results = data.items.map((item: any) => ({
        title: item.title, // Tên của tấm ảnh
        image: item.link, // Đường link ảnh thật
      }));
      return NextResponse.json(results);
    }

    return NextResponse.json([]); // Không tìm thấy thì trả về rỗng
  } catch (error) {
    console.error("Lỗi khi gọi Google API:", error);
    return NextResponse.json({ error: "Lỗi tìm kiếm" }, { status: 500 });
  }
}
