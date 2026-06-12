import { Search, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FormInput, FormSelect } from '../ui/FormField'

export default function ProductFilters({ search, onSearch, sort, onSort, onOpenFilter }) {
  const { t } = useTranslation()

  return (
    <div className="rounded-[15px] border border-white/12 bg-white/[0.05] backdrop-blur-sm p-4 md:p-5 mb-8">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-end">
        <FormInput
          icon={Search}
          label={t('products_page.search_label')}
          placeholder={t('nav.search')}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 min-w-0"
        />
        <FormSelect
          icon={SlidersHorizontal}
          label={t('products_page.sort_label')}
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="w-full md:w-56"
        >
          <option value="default" className="bg-[#0c1018]">{t('products_page.sort_default')}</option>
          <option value="price_asc" className="bg-[#0c1018]">{t('products_page.sort_price_asc')}</option>
          <option value="price_desc" className="bg-[#0c1018]">{t('products_page.sort_price_desc')}</option>
          <option value="rating" className="bg-[#0c1018]">{t('products_page.sort_rating')}</option>
        </FormSelect>
        <button
          type="button"
          onClick={onOpenFilter}
          className="md:hidden h-12 px-4 flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 text-white text-sm font-semibold"
        >
          <SlidersHorizontal size={18} />
          {t('products_page.filter')}
        </button>
      </div>
    </div>
  )
}
