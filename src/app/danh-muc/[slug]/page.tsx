import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

// 1. Component Thẻ Sản Phẩm (Giữ nguyên giao diện chuẩn)
const ProductCard = ({ product }: { product: any }) => (
  <div className="bg-white border rounded hover:shadow-lg transition-shadow duration-300 p-3 flex flex-col items-center text-center h-full">
    <div className="w-full h-40 mb-3 flex items-center justify-center overflow-hidden">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="max-h-full object-contain"
        />
      ) : (
        <div className="text-gray-300 text-sm">[Chưa có ảnh]</div>
      )}
    </div>
    <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 h-10">
      {product.name}
    </h3>

    <div className="mt-auto w-full">
      {product.old_price && (
        <p className="text-gray-400 line-through text-xs">
          {product.old_price.toLocaleString("vi-VN")} đ
        </p>
      )}
      <p className="text-red-600 font-bold text-lg mb-3">
        {product.price.toLocaleString("vi-VN")} đ
      </p>

      <a
        href="https://zalo.me/09xxxxxxx"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition text-sm flex items-center justify-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        LIÊN HỆ
      </a>
    </div>
  </div>
);

// 2. Main Component: Xử lý Logic Backend
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  // A. Lấy số trang hiện tại từ URL (Nếu không có thì mặc định là 1)
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = 15; // Cấu hình 15 sản phẩm / trang

  // B. TRUY VẤN 1: Tìm ID của Danh mục dựa vào slug trên URL
  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", params.slug)
    .single(); // Chỉ lấy 1 kết quả duy nhất

  // Xử lý lỗi an toàn: Nếu khách gõ bậy link (VD: /danh-muc/thuoc-linh-tinh), tự động đẩy ra trang 404
  if (catError || !category) {
    notFound();
  }

  // C. Tính toán tọa độ cắt dữ liệu (Công thức phân trang chuẩn)
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // D. TRUY VẤN 2: Lấy Sản phẩm thuộc Category đó + Đếm tổng số lượng
  const {
    data: products,
    count,
    error: prodError,
  } = await supabase
    .from("products")
    .select("*", { count: "exact" }) // Báo Supabase đếm tổng số dòng thỏa mãn
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("name", { ascending: true }) // Sắp xếp A-Z
    .range(from, to); // Chỉ lấy đúng 15 dòng thuộc trang hiện tại

  // E. Tính toán tổng số trang để vẽ UI
  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex flex-col gap-6 bg-white p-4 rounded shadow-sm">
      {/* Thanh điều hướng (Sử dụng tên thật của category lấy từ DB) */}
      <div className="bg-gray-50 border p-2 text-sm text-gray-600 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
          🏠 Trang chủ
        </Link>
        <span>›</span>
        <span className="text-gray-800 font-medium">{category.name}</span>
      </div>

      {/* Tiêu đề danh mục */}
      <h1 className="text-2xl font-bold text-gray-800 border-b pb-2">
        {category.name}{" "}
        <span className="text-sm font-normal text-gray-500">
          ({totalItems} sản phẩm)
        </span>
      </h1>

      {/* Lưới Sản phẩm */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 italic">
          Đang cập nhật sản phẩm cho danh mục này...
        </div>
      )}

      {/* Thanh Phân trang (Chỉ hiển thị nếu có nhiều hơn 1 trang) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 mb-4">
          {/* Nút lùi */}
          {currentPage > 1 && (
            <Link
              href={`/danh-muc/${params.slug}?page=${currentPage - 1}`}
              className="w-8 h-8 flex items-center justify-center border text-gray-600 hover:bg-gray-100 rounded"
            >
              ←
            </Link>
          )}

          {/* Vòng lặp sinh ra các nút 1, 2, 3... tự động dựa vào totalPages */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Link
                key={pageNum}
                href={`/danh-muc/${params.slug}?page=${pageNum}`}
                className={`w-8 h-8 flex items-center justify-center border rounded font-medium transition ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </Link>
            ),
          )}

          {/* Nút tiến */}
          {currentPage < totalPages && (
            <Link
              href={`/danh-muc/${params.slug}?page=${currentPage + 1}`}
              className="w-8 h-8 flex items-center justify-center border text-gray-600 hover:bg-gray-100 rounded"
            >
              →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
