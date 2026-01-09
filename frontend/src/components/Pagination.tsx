import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PixelButton } from './PixelButton'; // Đảm bảo đường dẫn đúng

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Nếu chỉ có 1 trang thì không cần hiện phân trang
//   if (totalPages <= 1) return null;

  // Tạo mảng số trang (ví dụ: [1, 2, 3])
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className={`flex justify-center items-center gap-2 mt-auto ${className}`}>
      {/* Nút Previous */}
      <PixelButton
        variant="secondary"
        className="w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft 
          size={20} 
          className="text-[#4A3B32] min-w-[20px] min-h-[20px]" 
        />
      </PixelButton>

      {/* Danh sách số trang */}
      <div className="flex gap-1 flex-wrap justify-center">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-10 h-10 font-vt323 text-lg border-2 border-[#4A3B32] transition-all 
              ${
                currentPage === page
                  ? 'bg-[#FF99AA] text-[#4A3B32] translate-y-[2px] shadow-none' // Active style
                  : 'bg-white hover:bg-gray-100 shadow-[2px_2px_0px_rgba(74,59,50,0.2)] active:translate-y-[2px] active:shadow-none' // Normal style
              }
            `}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Nút Next */}
      <PixelButton
        variant="secondary"
        className="w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight 
          size={20} 
          className="text-[#4A3B32] min-w-[20px] min-h-[20px]" 
        />
      </PixelButton>
    </div>
  );
};