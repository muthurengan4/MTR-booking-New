import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServicesOverview = ({ onServiceClick }) => {
  const services = [
  {
    id: 'accommodation',
    title: 'Accommodation Booking',
    description: 'Choose from luxury cottages, eco-friendly lodges, and comfortable rooms across three prime locations in the heart of wildlife territory',
    image: "https://images.unsplash.com/photo-1719368420509-059a3b22579e",
    imageAlt: 'Spacious luxury cottage bedroom with wooden furniture, large windows overlooking forest, comfortable king-size bed with white linens and warm ambient lighting',
    icon: 'Home',
    color: 'primary',
    features: ['3 Locations', '30+ Rooms', 'Multiple Types'],
    route: '/interactive-map-booking'
  },
  {
    id: 'safari',
    title: 'Safari Activities',
    description: 'Experience thrilling wildlife encounters with Jeep Safari, Bus Safari, and Elephant Camp visits guided by expert naturalists',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_16ab71167-1767005561811.png",
    imageAlt: 'Open-top safari jeep with tourists on dirt trail through dense forest, professional guide pointing at wildlife, morning sunlight filtering through trees',
    icon: 'Compass',
    color: 'accent',
    features: ['3 Safari Types', 'Expert Guides', 'Daily Slots'],
    route: '/activity-booking'
  },
  {
    id: 'education',
    title: 'Educational Center',
    description: 'Interactive learning platform for children with wildlife knowledge base, engaging games, quizzes, and downloadable certificates',
    image: "https://images.unsplash.com/photo-1653566031295-af3f032e0350",
    imageAlt: 'Young children gathered around interactive digital display showing colorful wildlife information, teacher guiding them, bright educational classroom setting',
    icon: 'GraduationCap',
    color: 'success',
    features: ['Knowledge Base', 'Games & Quizzes', 'Certificates'],
    route: '/home-landing'
  },
  {
    id: 'eshop',
    title: 'E-Shop & Adoption',
    description: 'Shop wildlife-themed souvenirs, gifts, and support conservation through animal adoption programs for special occasions',
    image: "https://images.unsplash.com/photo-1701772442602-a793e8e5f51b",
    imageAlt: 'Display of wildlife merchandise including plush tiger toys, conservation t-shirts, wooden handicrafts, and eco-friendly products on rustic wooden shelves',
    icon: 'ShoppingBag',
    color: 'secondary',
    features: ['Souvenirs', 'Animal Adoption', 'Donations'],
    route: '/e-shop'
  }];


  const handleServiceClick = (service) => {
    if (onServiceClick) {
      onServiceClick(service);
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3 md:mb-4">
            Explore Our Services
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for an unforgettable wildlife experience at Mudumalai Tiger Reserve
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          {services?.map((service, index) =>
          <div
            key={service?.id}
            className="group bg-card rounded-2xl shadow-lg overflow-hidden border border-border transition-organic hover:shadow-xl hover-lift">

              <div className="relative h-56 md:h-64 lg:h-72 overflow-hidden">
                <Image
                src={service?.image}
                alt={service?.imageAlt}
                className="w-full h-full object-cover transition-organic group-hover:scale-105" />

                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                
                <div className={`absolute top-4 left-4 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg ${
              service?.color === 'primary' ? 'bg-primary text-primary-foreground' :
              service?.color === 'accent' ? 'bg-accent text-accent-foreground' :
              service?.color === 'success' ? 'bg-success text-success-foreground' :
              'bg-secondary text-secondary-foreground'}`
              }>
                  <Icon name={service?.icon} size={24} strokeWidth={2} />
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground mb-3">
                  {service?.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mb-6 line-clamp-3">
                  {service?.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {service?.features?.map((feature, idx) =>
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs md:text-sm font-medium text-foreground">

                      <Icon name="Check" size={14} strokeWidth={2.5} color="var(--color-success)" />
                      <span>{feature}</span>
                    </div>
                )}
                </div>

                <Button
                variant="outline"
                fullWidth
                iconName="ArrowRight"
                iconPosition="right"
                onClick={() => handleServiceClick(service)}
                className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">

                  Explore {service?.title?.split(' ')?.[0]}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 md:mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-primary/5 border border-primary/20 rounded-xl">
            <Icon name="Info" size={24} color="var(--color-primary)" strokeWidth={2} />
            <p className="text-sm md:text-base text-foreground">
              <span className="font-semibold">New to MTR?</span> Start with accommodation booking and add activities during checkout
            </p>
          </div>
        </div>
      </div>
    </section>);

};

export default ServicesOverview;