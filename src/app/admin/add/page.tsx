"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState({
    name: "",
    image_url: "",
  });

  // Lấy danh mục từ Supabase
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("id, name");
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  // Gọi API tìm kiếm
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (
        searchQuery.trim().length > 2 &&
        searchQuery !== selectedProduct.name
      ) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `/api/search-medicine?q=${encodeURIComponent(searchQuery)}`,
          );
          const data = await res.json();
          setSuggestions(data);
        } catch (error) {
          console.error("Lỗi tìm kiếm:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedProduct.name]);

  const handleSelectSuggestion = (suggestion: any) => {
    setSearchQuery(suggestion.title);
    setSelectedProduct({
      name: suggestion.title,
      image_url: suggestion.image,
    });
    setSuggestions([]);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const category_id = formData.get("category_id") as string;
    const price = Number(formData.get("price"));
    const stock_quantity = Number(formData.get("stock"));

    const { error } = await supabase.from("products").insert({
      name: selectedProduct.name || searchQuery,
      price,
      stock_quantity,
      category_id: category_id === "" ? null : category_id,
      image_url: selectedProduct.image_url,
      is_active: true,
    });

    setIsSubmitting(false);

    if (error) {
      alert("Lỗi thêm sản phẩm: " + error.message);
    } else {
      alert("Thêm sản phẩm thành công!");
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="text-gray-500 hover:text-gray-800 font-medium"
        >
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          Thêm thuốc thông minh
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border p-6 space-y-6"
      >
        <div className="relative">
          <label className="block text-gray-700 font-bold mb-2">
            Tên thuốc (Gõ để tìm ảnh từ Google)
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
            placeholder="VD: Elevit, Panadol..."
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
          />

          {isSearching && (
            <div className="absolute right-3 top-11 text-sm text-gray-400">
              Đang tìm...
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  className="flex items-center gap-4 p-3 hover:bg-blue-50 cursor-pointer border-b"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 object-cover border rounded"
                  />
                  <span className="font-semibold text-gray-800">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedProduct.image_url && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 border rounded-lg">
            <img
              src={selectedProduct.image_url}
              alt="Preview"
              className="w-20 h-20 object-cover border bg-white"
            />
            <div>
              <div className="text-sm text-green-600 font-bold flex items-center gap-1">
                <span>✓</span> Đã bắt được ảnh sản phẩm
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {selectedProduct.name}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Phân loại danh mục
          </label>
          <select
            name="category_id"
            required
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">-- Chọn danh mục thuốc --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Giá bán (VNĐ)
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              placeholder="VD: 50000"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Số lượng tồn kho
            </label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              placeholder="VD: 100"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || searchQuery === ""}
          className={`w-full py-4 rounded-lg font-bold text-white transition text-lg shadow-md mt-4 
            ${isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {isSubmitting ? "Đang lưu vào kho..." : "+ LƯU THUỐC NÀY"}
        </button>
      </form>
    </div>
  );
}
