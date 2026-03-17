import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyCart = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: 'Book Accommodation',
      description: 'Explore rooms across Masinagudi, Thepakadu & Gudalur',
      icon: 'Home',
      path: '/interactive-map-booking',
      color: 'var(--color-primary)'
    },
    {
      title: 'Book Activities',
      description: 'Jeep Safari, Bus Safari & Elephant Camp visits',
      icon: 'Compass',
      path: '/activity-booking',
      color: 'var(--color-accent)'
    },
    {
      title: 'Shop Souvenirs',
      description: 'Wildlife-themed gifts and merchandise',
      icon: 'ShoppingBag',
      path: '/e-shop',
      color: 'var(--color-secondary)'
    }
  ];

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 md:px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="ShoppingCart" size={48} color="var(--color-muted-foreground)" strokeWidth={1.5} />
        </div>

        <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-3">
          Your Cart is Empty
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8 max-measure mx-auto">
          Start planning your wildlife adventure by adding accommodations, activities, or shopping for souvenirs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickLinks?.map((link, index) => (
            <button
              key={index}
              onClick={() => navigate(link?.path)}
              className="p-6 bg-card border border-border rounded-xl transition-organic hover:shadow-md hover-lift active-press text-left"
            >
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Icon name={link?.icon} size={24} color={link?.color} strokeWidth={2} />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                {link?.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {link?.description}
              </p>
            </button>
          ))}
        </div>

        <Button
          variant="default"
          size="lg"
          iconName="Home"
          iconPosition="left"
          onClick={() => navigate('/home-landing')}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default EmptyCart;