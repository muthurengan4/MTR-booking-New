import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProductCard from './components/ProductCard';
import CategoryFilter from './components/CategoryFilter';
import FeaturedCarousel from './components/FeaturedCarousel';
import QuickViewModal from './components/QuickViewModal';
import SearchBar from './components/SearchBar';
import MobileFilterDrawer from './components/MobileFilterDrawer';
import { useCart } from '../../contexts/CartContext';

// Simple toast notification
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all transform ${
    type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

const EShop = () => {
  const navigate = useNavigate();
  const { addToCart, getCartCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = [
  { id: 'apparel', name: 'Apparel', icon: 'Shirt', count: 24 },
  { id: 'accessories', name: 'Accessories', icon: 'Watch', count: 18 },
  { id: 'books', name: 'Books & Media', icon: 'BookOpen', count: 15 },
  { id: 'toys', name: 'Toys & Games', icon: 'Gamepad2', count: 12 },
  { id: 'conservation', name: 'Conservation Items', icon: 'Leaf', count: 20 },
  { id: 'home', name: 'Home Decor', icon: 'Home', count: 16 },
  { id: 'stationery', name: 'Stationery', icon: 'PenTool', count: 14 },
  { id: 'adoption', name: 'Adoption Gifts', icon: 'Gift', count: 8 }];


  const featuredProducts = [
  {
    id: 'f1',
    name: 'Tiger Conservation T-Shirt',
    description: 'Premium organic cotton t-shirt featuring exclusive MTR tiger artwork. 100% of proceeds support tiger conservation programs.',
    price: 899,
    originalPrice: 1299,
    image: "https://images.unsplash.com/photo-1605760719369-be714c32a7f6",
    imageAlt: 'White organic cotton t-shirt with artistic orange and black tiger print design displayed on wooden hanger against natural background',
    tag: 'Conservation Special',
    category: 'apparel'
  },
  {
    id: 'f2',
    name: 'Wildlife Photography Book',
    description: 'Stunning collection of wildlife photographs from Mudumalai Tiger Reserve capturing rare moments of tigers, elephants, and diverse flora.',
    price: 1499,
    originalPrice: 1999,
    image: "https://images.unsplash.com/photo-1676084979417-386773ac79af",
    imageAlt: 'Hardcover coffee table book with glossy cover showing majestic Bengal tiger in natural forest habitat with golden sunlight filtering through trees',
    tag: 'New Arrival',
    category: 'books'
  },
  {
    id: 'f3',
    name: 'Bamboo Water Bottle',
    description: 'Eco-friendly insulated water bottle made from sustainable bamboo. Perfect for safari adventures while supporting zero-waste initiatives.',
    price: 749,
    originalPrice: 999,
    image: "https://images.unsplash.com/photo-1589365278144-c9e705f843ba",
    imageAlt: 'Natural bamboo insulated water bottle with stainless steel cap and MTR wildlife reserve logo engraved on smooth wooden surface',
    tag: 'Best Seller',
    category: 'accessories'
  }];


  const products = [
  {
    id: 'p1',
    name: 'MTR Wildlife Cap',
    description: 'Comfortable cotton cap with embroidered MTR logo and tiger motif.',
    fullDescription: 'Premium quality cotton cap featuring detailed embroidered MTR logo and artistic tiger motif. Adjustable strap ensures perfect fit for all head sizes. UV protection fabric keeps you cool during safari adventures.',
    price: 499,
    originalPrice: 699,
    rating: 4.5,
    reviewCount: 128,
    stock: 45,
    badge: 'Best Seller',
    category: 'apparel',
    images: [
    { url: "https://images.unsplash.com/photo-1661453444153-b0cceeaadd4c", alt: 'Navy blue cotton baseball cap with embroidered MTR tiger reserve logo and orange tiger silhouette on front panel' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_1271847bb-1764664587222.png", alt: 'Side view of navy cap showing adjustable strap and breathable mesh panels for ventilation' },
    { url: "https://images.unsplash.com/photo-1678077118784-1b12bd92e284", alt: 'Close-up of detailed embroidered tiger motif with orange and black thread work on cap brim' }],

    sizes: [
    { value: 'one-size', label: 'One Size (Adjustable)' }],

    colors: [
    { value: 'navy', label: 'Navy Blue' },
    { value: 'olive', label: 'Olive Green' },
    { value: 'khaki', label: 'Khaki' }],

    conservationInfo: '₹50 from each purchase supports tiger habitat restoration programs.'
  },
  {
    id: 'p2',
    name: 'Elephant Plush Toy',
    description: 'Soft and cuddly elephant plush toy for children, made from eco-friendly materials.',
    fullDescription: 'Adorable handcrafted elephant plush toy made from 100% organic cotton and recycled polyester filling. Safe for children of all ages with embroidered features. Each purchase supports elephant welfare programs.',
    price: 799,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 256,
    stock: 32,
    badge: 'New Arrival',
    category: 'toys',
    images: [
    { url: "https://images.unsplash.com/photo-1631741782517-c09784cae0e5", alt: 'Gray plush elephant toy with soft fabric texture, embroidered eyes, and friendly smile sitting on white background' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_11a0b8cd9-1768243583683.png", alt: 'Side profile of elephant plush showing detailed trunk, large ears, and sturdy legs with non-toxic materials' },
    { url: "https://images.unsplash.com/photo-1727343291776-0d78d623b8a5", alt: 'Close-up of elephant plush face showing embroidered safety eyes and gentle expression suitable for children' }],

    sizes: [
    { value: 'small', label: 'Small (8 inches)' },
    { value: 'medium', label: 'Medium (12 inches)' },
    { value: 'large', label: 'Large (16 inches)' }],

    conservationInfo: '₹100 from each purchase goes directly to elephant rescue and rehabilitation centers.'
  },
  {
    id: 'p3',
    name: 'Wildlife Field Guide',
    description: 'Comprehensive field guide to flora and fauna of Mudumalai Tiger Reserve.',
    fullDescription: 'Detailed 300-page field guide featuring high-resolution photographs and descriptions of over 500 species found in MTR. Includes identification tips, behavior patterns, and conservation status. Perfect companion for nature enthusiasts.',
    price: 1299,
    originalPrice: 1599,
    rating: 4.9,
    reviewCount: 89,
    stock: 18,
    badge: null,
    category: 'books',
    images: [
    { url: "https://images.unsplash.com/photo-1704473034581-22f5b9990b85", alt: 'Hardcover wildlife field guide book with glossy cover showing Bengal tiger in lush green forest setting' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_1423dd21d-1766933288168.png", alt: 'Open book pages displaying colorful wildlife photographs with detailed species descriptions and identification charts' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_14e18e932-1768386268603.png", alt: 'Book spine and back cover showing table of contents and author credentials with nature photography background' }],

    conservationInfo: 'Authored by MTR naturalists with proceeds supporting wildlife research and documentation.'
  },
  {
    id: 'p4',
    name: 'Reusable Jute Bag',
    description: 'Eco-friendly jute shopping bag with wildlife print design.',
    fullDescription: 'Durable handwoven jute bag featuring vibrant wildlife artwork. Reinforced handles and spacious interior make it perfect for shopping or daily use. Washable and long-lasting alternative to plastic bags.',
    price: 349,
    originalPrice: 499,
    rating: 4.3,
    reviewCount: 167,
    stock: 78,
    badge: 'Conservation',
    category: 'accessories',
    images: [
    { url: "https://images.unsplash.com/photo-1652255657221-d073a8e76877", alt: 'Natural beige jute shopping bag with colorful tiger and elephant print design and sturdy rope handles' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_1a677865d-1768291477739.png", alt: 'Side view of jute bag showing spacious interior, reinforced bottom, and eco-friendly construction details' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_1e24cb852-1768809814115.png", alt: 'Close-up of wildlife print artwork on jute bag featuring detailed illustrations of forest animals and plants' }],

    sizes: [
    { value: 'medium', label: 'Medium (12x15 inches)' },
    { value: 'large', label: 'Large (15x18 inches)' }],

    conservationInfo: 'Replaces 500+ plastic bags over its lifetime. Supports local artisan communities.'
  },
  {
    id: 'p5',
    name: 'Tiger Adoption Certificate Frame',
    description: 'Premium wooden frame for tiger adoption certificates with conservation theme.',
    fullDescription: 'Handcrafted wooden frame made from sustainable teak wood with laser-engraved wildlife motifs. Includes certificate mount and glass protection. Perfect for displaying your tiger adoption certificate with pride.',
    price: 899,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 45,
    stock: 23,
    badge: null,
    category: 'adoption',
    images: [
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_190170756-1768809816710.png", alt: 'Dark teak wooden certificate frame with intricate laser-engraved tiger and forest border design on natural wood grain' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_19cf73e94-1768809815109.png", alt: 'Frame corner detail showing quality craftsmanship, smooth finish, and protective glass panel for certificate display' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_1940d966b-1769668292371.png", alt: 'Back of frame showing secure mounting hardware, hanging wire, and certificate holder clips' }],

    sizes: [
    { value: 'a4', label: 'A4 Size' },
    { value: 'a3', label: 'A3 Size' }],

    colors: [
    { value: 'teak', label: 'Natural Teak' },
    { value: 'walnut', label: 'Dark Walnut' },
    { value: 'oak', label: 'Light Oak' }],

    conservationInfo: 'Made from certified sustainable wood sources supporting forest conservation.'
  },
  {
    id: 'p6',
    name: 'Wildlife Puzzle Set',
    description: 'Educational 500-piece jigsaw puzzle featuring MTR wildlife scenes.',
    fullDescription: '500-piece premium quality jigsaw puzzle showcasing stunning wildlife photography from Mudumalai. Includes educational booklet about featured animals. Perfect for family bonding and learning about conservation.',
    price: 649,
    originalPrice: 799,
    rating: 4.6,
    reviewCount: 134,
    stock: 41,
    badge: null,
    category: 'toys',
    images: [
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_18d412500-1764694850050.png", alt: 'Colorful jigsaw puzzle box showing completed image of tiger family in natural forest habitat with vibrant colors' },
    { url: "https://images.unsplash.com/photo-1663625318127-bd35dd2e6f75", alt: 'Partially completed puzzle on table showing high-quality interlocking pieces and detailed wildlife photography' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_12f7fce3c-1768809818283.png", alt: 'Puzzle pieces close-up displaying precision-cut edges and vivid color printing on thick cardboard material' }],

    conservationInfo: 'Includes educational content about endangered species and their habitats.'
  },
  {
    id: 'p7',
    name: 'Bamboo Pen Set',
    description: 'Eco-friendly bamboo pen set with wildlife engravings.',
    fullDescription: 'Set of 3 premium bamboo pens with smooth writing ink refills. Each pen features unique wildlife engravings. Comes in sustainable bamboo gift box. Perfect for nature lovers and eco-conscious professionals.',
    price: 449,
    originalPrice: null,
    rating: 4.4,
    reviewCount: 92,
    stock: 56,
    badge: null,
    category: 'stationery',
    images: [
    { url: "https://images.unsplash.com/photo-1633878353940-6fa00dbf676d", alt: 'Three natural bamboo pens with laser-engraved tiger, elephant, and deer designs displayed in bamboo gift box' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_110d7f09e-1768809816689.png", alt: 'Close-up of bamboo pen showing detailed wildlife engraving, smooth finish, and comfortable grip design' },
    { url: "https://images.unsplash.com/photo-1621866271250-9dc9780cfc1f", alt: 'Pen set in open gift box with velvet interior lining and individual pen slots for secure storage' }],

    conservationInfo: 'Made from fast-growing bamboo, a sustainable alternative to plastic pens.'
  },
  {
    id: 'p8',
    name: 'Wildlife Wall Calendar 2026',
    description: 'Premium wall calendar featuring stunning wildlife photography from MTR.',
    fullDescription: '12-month wall calendar with large format wildlife photographs. Each month features different species with conservation facts and tips. Printed on recycled paper with eco-friendly inks.',
    price: 399,
    originalPrice: 499,
    rating: 4.8,
    reviewCount: 203,
    stock: 67,
    badge: 'Best Seller',
    category: 'stationery',
    images: [
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_18b4ac541-1768171242410.png", alt: 'Large format wall calendar showing January page with majestic tiger photograph and monthly grid layout' },
    { url: "https://images.unsplash.com/photo-1714046437876-d206e67d38c0", alt: 'Calendar pages fanned out displaying variety of wildlife photographs including elephants, deer, and birds' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_131d894d0-1768809815096.png", alt: 'Calendar back cover showing hanging wire, conservation facts section, and eco-friendly printing certification' }],

    conservationInfo: 'Printed on 100% recycled paper using vegetable-based inks.'
  },
  {
    id: 'p9',
    name: 'Ceramic Wildlife Mug',
    description: 'Handcrafted ceramic mug with hand-painted wildlife designs.',
    fullDescription: 'Beautiful handcrafted ceramic mug featuring hand-painted wildlife artwork by local artisans. Microwave and dishwasher safe. Each mug is unique with slight variations in design.',
    price: 549,
    originalPrice: 699,
    rating: 4.5,
    reviewCount: 178,
    stock: 34,
    badge: null,
    category: 'home',
    images: [
    { url: "https://images.unsplash.com/photo-1666866879966-f8a63f04f445", alt: 'White ceramic mug with hand-painted orange tiger design and green forest elements on smooth glazed surface' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_1038c71a6-1769553966186.png", alt: 'Side view of mug showing comfortable handle, sturdy base, and detailed wildlife artwork wrapping around body' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_167a8a5b3-1768607661004.png", alt: 'Top view of mug interior showing quality ceramic finish and artist signature on bottom' }],

    colors: [
    { value: 'tiger', label: 'Tiger Design' },
    { value: 'elephant', label: 'Elephant Design' },
    { value: 'peacock', label: 'Peacock Design' }],

    conservationInfo: 'Supports local artisan communities and traditional craft preservation.'
  },
  {
    id: 'p10',
    name: 'Kids Wildlife Activity Book',
    description: 'Interactive activity book with puzzles, coloring pages, and wildlife facts.',
    fullDescription: '64-page activity book designed for children aged 6-12. Includes coloring pages, word searches, mazes, and educational content about MTR wildlife. Printed on child-safe paper with non-toxic inks.',
    price: 299,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 312,
    stock: 89,
    badge: 'New Arrival',
    category: 'books',
    images: [
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_170ed850c-1769462032887.png", alt: 'Colorful children activity book cover with cartoon wildlife characters and bold title text on bright background' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_1d81d8702-1768809814737.png", alt: 'Open activity book showing coloring page with tiger outline and educational facts sidebar' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_118de0421-1768809815671.png", alt: 'Activity book pages displaying word search puzzle, maze game, and wildlife identification quiz' }],

    conservationInfo: 'Teaches children about wildlife conservation through fun interactive activities.'
  },
  {
    id: 'p11',
    name: 'Wildlife Keychain Set',
    description: 'Set of 3 metal keychains with wildlife charms.',
    fullDescription: 'Premium metal keychain set featuring detailed wildlife charms (tiger, elephant, peacock). Durable construction with secure key rings. Perfect as gifts or personal accessories.',
    price: 249,
    originalPrice: 349,
    rating: 4.2,
    reviewCount: 156,
    stock: 124,
    badge: null,
    category: 'accessories',
    images: [
    { url: "https://images.unsplash.com/photo-1680487021687-c635198a3ccf", alt: 'Three metal keychains with detailed tiger, elephant, and peacock charms on silver key rings' },
    { url: "https://images.unsplash.com/photo-1680320390435-9baa4ec6e0dc", alt: 'Close-up of tiger keychain showing intricate metal detailing and antique bronze finish' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_1b3b5fd0c-1768809815693.png", alt: 'Keychain set in small gift box with velvet cushioning and MTR logo on lid' }],

    conservationInfo: 'Portion of proceeds supports wildlife monitoring and tracking programs.'
  },
  {
    id: 'p12',
    name: 'Organic Cotton Tote Bag',
    description: 'Large organic cotton tote bag with screen-printed wildlife design.',
    fullDescription: 'Spacious tote bag made from 100% organic cotton with vibrant screen-printed wildlife artwork. Strong handles and reinforced stitching. Perfect for shopping, beach trips, or daily use.',
    price: 599,
    originalPrice: 799,
    rating: 4.6,
    reviewCount: 198,
    stock: 52,
    badge: 'Conservation',
    category: 'accessories',
    images: [
    { url: "https://images.unsplash.com/photo-1696061873245-3acc4aecfdd9", alt: 'Natural beige organic cotton tote bag with colorful screen-printed forest scene and wildlife silhouettes' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_10f3015db-1764808252373.png", alt: 'Tote bag interior showing spacious main compartment, inner pocket, and quality cotton lining' },
    { url: "https://img.rocket.new/generatedImages/rocket_gen_img_164e8eee0-1768466158525.png", alt: 'Close-up of screen-printed design showing vibrant colors and detailed wildlife artwork on cotton fabric' }],

    sizes: [
    { value: 'standard', label: 'Standard (16x18 inches)' }],

    conservationInfo: 'Made from certified organic cotton supporting sustainable farming practices.'
  }];


  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered?.filter((p) => p?.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered?.filter((p) =>
      p?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      p?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'price-low':
        filtered?.sort((a, b) => a?.price - b?.price);
        break;
      case 'price-high':
        filtered?.sort((a, b) => b?.price - a?.price);
        break;
      case 'newest':
        filtered?.sort((a, b) => (b?.badge === 'New Arrival' ? 1 : 0) - (a?.badge === 'New Arrival' ? 1 : 0));
        break;
      case 'rating':
        filtered?.sort((a, b) => b?.rating - a?.rating);
        break;
      case 'popular':
        filtered?.sort((a, b) => b?.reviewCount - a?.reviewCount);
        break;
      default:
        break;
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = async (product) => {
    try {
      await addToCart({
        type: 'product',
        id: product?.id,
        name: product?.name,
        price: product?.price,
        quantity: product?.quantity || 1,
        totalPrice: product?.price * (product?.quantity || 1),
        details: {
          image: product?.image,
          category: product?.category,
          description: product?.description
        }
      });
      showToast(`${product?.name} added to cart!`);
    } catch (error) {
      showToast('Failed to add item to cart', 'error');
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[88px]">
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 py-12 md:py-16 lg:py-20">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="ShoppingBag" size={32} color="var(--color-primary)" strokeWidth={2} />
                <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground">
                  MTR E-Shop
                </h1>
              </div>
              <p className="text-base md:text-lg text-muted-foreground max-measure">
                Shop wildlife-themed souvenirs, conservation merchandise, and educational materials. Every purchase supports MTR conservation initiatives and local communities.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
          <FeaturedCarousel
            products={featuredProducts}
            onProductClick={(product) => setSelectedProduct(product)} />


          <div className="mt-8 md:mt-10 lg:mt-12">
            <SearchBar
              onSearch={setSearchQuery}
              onSortChange={setSortBy}
              sortValue={sortBy} />

          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6 md:gap-8 lg:gap-10 mt-8 md:mt-10 lg:mt-12">
            <aside className="hidden lg:block">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                onClearFilters={handleClearFilters} />

            </aside>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground">
                    {selectedCategory ?
                    categories?.find((c) => c?.id === selectedCategory)?.name :
                    'All Products'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredAndSortedProducts?.length} products found
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="default"
                  iconName="Filter"
                  iconPosition="left"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden">

                  Filter
                </Button>
              </div>

              {filteredAndSortedProducts?.length === 0 ?
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                  <Icon name="Package" size={64} color="var(--color-muted-foreground)" strokeWidth={1.5} className="mx-auto mb-4" />
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <Button
                  variant="outline"
                  iconName="RotateCcw"
                  iconPosition="left"
                  onClick={handleClearFilters}>

                    Clear All Filters
                  </Button>
                </div> :

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  {filteredAndSortedProducts?.map((product) =>
                <ProductCard
                  key={product?.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQuickView={setSelectedProduct} />

                )}
                </div>
              }
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-success/10 via-primary/5 to-accent/10 py-12 md:py-16 lg:py-20 mt-12 md:mt-16 lg:mt-20">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Icon name="Leaf" size={48} color="var(--color-success)" strokeWidth={2} className="mx-auto mb-6" />
              <h2 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
                Your Purchase Makes a Difference
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8">
                Every item purchased from our e-shop directly contributes to wildlife conservation efforts, habitat restoration, and community development programs at Mudumalai Tiger Reserve.
              </p>
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <Icon name="Trees" size={32} color="var(--color-primary)" strokeWidth={2} className="mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Habitat Protection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Funds forest restoration and wildlife corridor maintenance
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <Icon name="Users" size={32} color="var(--color-secondary)" strokeWidth={2} className="mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Community Support
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Supports local artisans and sustainable livelihoods
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <Icon name="GraduationCap" size={32} color="var(--color-accent)" strokeWidth={2} className="mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Education Programs
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enables wildlife education for children and communities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {selectedProduct &&
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart} />

      }
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange} />

    </div>);

};

export default EShop;