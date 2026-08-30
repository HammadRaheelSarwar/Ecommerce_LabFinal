import { useEffect, useState } from 'react'
import HeroSection from '../components/home/HeroSection'
import ShopByCategory from '../components/home/ShopByCategory'
import ShopByOccasion from '../components/home/ShopByOccasion'
import ProductSectionRow from '../components/home/ProductSectionRow'
import WhyShopWithUs from '../components/home/WhyShopWithUs'
import Newsletter from '../components/home/Newsletter'
import { contentService } from '../services/contentService'

export default function HomePage() {
  const [sections, setSections] = useState({})

  useEffect(() => {
    document.title = 'All Available — Everything You Desire, Delivered'
    contentService.getHomepageSections()
      .then(res => setSections(res.data.sections || {}))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-2">
      {/* 1. Hero with Pakistan & Global Sourcing cards (Screenshot 1) */}
      <HeroSection data={sections.hero} />

      {/* 2. Shop by category 2-row rounded white card (Screenshot 1) */}
      <ShopByCategory />

      {/* 3. Shop by occasion with pills & visual search banner (Screenshot 2) */}
      <ShopByOccasion />

      {/* 4. Trending Now Sponsored Carousel (Screenshot 3 Top) */}
      <ProductSectionRow
        title="Trending Now"
        emoji="📈"
        badgeText="Sponsored"
        filterParams={{ isBestSeller: true, limit: 12 }}
        seeAllLink="/shop?isBestSeller=true"
      />

      {/* 5. Latest Onboarded Brands Carousel (Screenshot 3 Bottom) */}
      <ProductSectionRow
        title="Latest Onboarded Brands!!"
        filterParams={{ isNewArrival: true, limit: 12 }}
        seeAllLink="/shop?isNewArrival=true"
      />

      {/* 6. Trending Products Carousel (Screenshot 4) */}
      <ProductSectionRow
        title="Trending Products"
        emoji="🔥"
        filterParams={{ sort: 'popular', limit: 12 }}
        seeAllLink="/shop?sort=popular"
      />

      {/* 7. Why Shop With Us Trust Badges */}
      <WhyShopWithUs />

      {/* 8. Newsletter Callout */}
      <Newsletter data={sections.newsletter} />
    </div>
  )
}
