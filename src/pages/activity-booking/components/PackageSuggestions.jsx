import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PackageSuggestions = ({ selectedActivities, onPackageSelect }) => {
  const packageDeals = [
  {
    id: 'pkg-1',
    name: 'Complete Wildlife Experience',
    description: 'Combine Jeep Safari and Elephant Camp Visit for the ultimate wildlife adventure',
    activities: ['Jeep Safari', 'Elephant Camp Visit'],
    originalPrice: 3500,
    packagePrice: 2800,
    discount: 20,
    image: "https://images.unsplash.com/photo-1716998462052-444dfb5e58ac",
    imageAlt: 'Safari jeep driving through dense forest with elephants visible in background during golden hour',
    highlights: [
    'Save ₹700 on combined booking',
    'Priority slot allocation',
    'Complimentary wildlife guide',
    'Free photography session'],

    duration: '6-7 hours',
    bestFor: 'Wildlife enthusiasts'
  },
  {
    id: 'pkg-2',
    name: 'Safari Combo',
    description: 'Experience both Jeep and Bus Safari to explore different zones of the reserve',
    activities: ['Jeep Safari', 'Bus Safari'],
    originalPrice: 3000,
    packagePrice: 2400,
    discount: 20,
    image: "https://images.unsplash.com/photo-1674556275189-e78fd6223e6d",
    imageAlt: 'Group of tourists in open safari vehicle observing wild elephants in natural habitat with lush greenery',
    highlights: [
    'Save ₹600 on combined booking',
    'Access to multiple zones',
    'Extended safari duration',
    'Refreshments included'],

    duration: '5-6 hours',
    bestFor: 'Adventure seekers'
  },
  {
    id: 'pkg-3',
    name: 'Full Day Adventure',
    description: 'All three activities in one day for the complete MTR experience',
    activities: ['Jeep Safari', 'Bus Safari', 'Elephant Camp Visit'],
    originalPrice: 5000,
    packagePrice: 3750,
    discount: 25,
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b7aa2fb3-1768809815591.png",
    imageAlt: 'Panoramic view of Mudumalai Tiger Reserve showing diverse wildlife including elephants, deer and birds in natural setting',
    highlights: [
    'Save ₹1,250 on combined booking',
    'Lunch included',
    'Professional photographer',
    'Souvenir package',
    'Priority booking for all activities'],

    duration: '8-9 hours',
    bestFor: 'Complete experience'
  }];


  const isPackageRelevant = (pkg) => {
    if (selectedActivities?.length === 0) return true;
    return pkg?.activities?.some((activity) =>
    selectedActivities?.some((selected) => selected?.name === activity)
    );
  };

  const relevantPackages = packageDeals?.filter(isPackageRelevant);

  if (relevantPackages?.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon name="Gift" size={24} strokeWidth={2} color="var(--color-accent)" />
        </div>
        <div>
          <h3 className="font-heading text-xl md:text-2xl font-semibold text-foreground">
            Package Deals
          </h3>
          <p className="text-sm text-muted-foreground">Save more by booking activity combinations</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {relevantPackages?.map((pkg) =>
        <div key={pkg?.id} className="bg-background rounded-xl border border-border overflow-hidden transition-organic hover-lift">
            <div className="relative h-40 md:h-48 overflow-hidden">
              <Image
              src={pkg?.image}
              alt={pkg?.imageAlt}
              className="w-full h-full object-cover" />

              <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                {pkg?.discount}% OFF
              </div>
            </div>

            <div className="p-4 md:p-5">
              <h4 className="font-heading text-lg md:text-xl font-semibold text-foreground mb-2">
                {pkg?.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {pkg?.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {pkg?.activities?.map((activity, index) =>
              <span key={index} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {activity}
                  </span>
              )}
              </div>

              <div className="space-y-2 mb-4">
                {pkg?.highlights?.slice(0, 3)?.map((highlight, index) =>
              <div key={index} className="flex items-start gap-2">
                    <Icon name="Check" size={16} strokeWidth={2} className="text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{highlight}</span>
                  </div>
              )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Clock" size={16} strokeWidth={2} />
                  <span className="text-sm">{pkg?.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Target" size={16} strokeWidth={2} />
                  <span className="text-sm">{pkg?.bestFor}</span>
                </div>
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground line-through">
                    ₹{pkg?.originalPrice?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{pkg?.packagePrice?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-success font-medium">
                    Save ₹{(pkg?.originalPrice - pkg?.packagePrice)?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <Button
              variant="default"
              fullWidth
              onClick={() => onPackageSelect(pkg)}
              iconName="ShoppingCart"
              iconPosition="left">

                Select Package
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>);

};

export default PackageSuggestions;