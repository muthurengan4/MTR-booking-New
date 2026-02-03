import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConservationSpotlight = ({ onAdoptClick, onNewsClick }) => {
  const adoptionPrograms = [
  {
    id: 'tiger-adoption',
    animal: 'Bengal Tiger',
    name: 'Raju',
    age: '8 Years',
    description: 'Support the conservation of this majestic male tiger and contribute to habitat protection and anti-poaching efforts',
    image: "https://images.unsplash.com/photo-1698586730784-7ce46963efb9",
    imageAlt: 'Majestic Bengal tiger with orange and black stripes walking through tall grass, intense amber eyes looking directly at camera in natural forest habitat',
    monthlySupport: 5000,
    icon: 'Heart',
    impact: 'Protects 50 sq km habitat'
  },
  {
    id: 'elephant-adoption',
    animal: 'Asian Elephant',
    name: 'Lakshmi',
    age: '12 Years',
    description: 'Help provide care, medical treatment, and rehabilitation for this rescued elephant at our conservation center',
    image: "https://images.unsplash.com/photo-1695280087835-b129a44d57f9",
    imageAlt: 'Gentle Asian elephant with large ears and tusks standing in shallow river water, mahout beside her, surrounded by lush green forest vegetation',
    monthlySupport: 3000,
    icon: 'Heart',
    impact: 'Supports daily care & medical needs'
  }];


  const newsUpdates = [
  {
    id: 'news-1',
    title: 'New Tiger Cubs Spotted in Thepakadu Zone',
    date: '15 Jan 2026',
    category: 'Wildlife Sighting',
    excerpt: 'Forest officials confirm sighting of three tiger cubs with their mother in the core area, indicating healthy breeding population',
    image: "https://images.unsplash.com/photo-1618142990632-1afb1bd67e7c",
    imageAlt: 'Three small tiger cubs playing together on forest floor with mother tiger watching protectively in background, dappled sunlight through trees',
    icon: 'Newspaper'
  },
  {
    id: 'news-2',
    title: 'Monsoon Preparedness Drive Completed',
    date: '12 Jan 2026',
    category: 'Conservation',
    excerpt: 'MTR completes infrastructure upgrades and wildlife corridor maintenance ahead of monsoon season to ensure animal safety',
    image: "https://images.unsplash.com/photo-1630718921536-f6fe47691472",
    imageAlt: 'Forest department team in green uniforms working on wooden bridge repair over stream, surrounded by dense monsoon forest with dark clouds overhead',
    icon: 'Newspaper'
  },
  {
    id: 'news-3',
    title: 'School Education Program Reaches 5000 Students',
    date: '08 Jan 2026',
    category: 'Education',
    excerpt: 'MTR educational outreach program successfully engages 5000 students from 50 schools in wildlife conservation awareness',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_13a3f63c5-1768148643514.png",
    imageAlt: 'Large group of school children in uniforms sitting attentively in outdoor classroom, forest ranger showing wildlife posters, trees in background',
    icon: 'Newspaper'
  }];


  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          <div>
            <div className="mb-8 md:mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Icon name="Heart" size={24} color="var(--color-accent)" strokeWidth={2} />
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
                  Animal Adoption
                </h2>
              </div>
              <p className="text-base md:text-lg text-muted-foreground">
                Make a lasting impact by adopting an animal and supporting conservation efforts at MTR
              </p>
            </div>

            <div className="space-y-6">
              {adoptionPrograms?.map((program) =>
              <div
                key={program?.id}
                className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border transition-organic hover:shadow-xl hover-lift">

                  <div className="grid md:grid-cols-5 gap-0">
                    <div className="md:col-span-2 relative h-48 md:h-full overflow-hidden">
                      <Image
                      src={program?.image}
                      alt={program?.imageAlt}
                      className="w-full h-full object-cover transition-organic hover:scale-105" />

                      <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                        {program?.age}
                      </div>
                    </div>

                    <div className="md:col-span-3 p-6">
                      <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-2">
                        {program?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">{program?.animal}</p>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {program?.description}
                      </p>

                      <div className="flex items-center gap-2 mb-4 p-3 bg-success/10 rounded-lg">
                        <Icon name="Leaf" size={18} color="var(--color-success)" strokeWidth={2} />
                        <span className="text-sm text-success font-medium">{program?.impact}</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly Support</p>
                          <p className="text-2xl font-bold text-primary">₹{program?.monthlySupport?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <Button
                      variant="default"
                      fullWidth
                      iconName="Heart"
                      iconPosition="left"
                      onClick={() => onAdoptClick(program)}>

                        Adopt {program?.name}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                iconName="Gift"
                iconPosition="left"
                onClick={() => window.location.href = '/e-shop'}>

                View All Adoption Programs
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-8 md:mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Newspaper" size={24} color="var(--color-primary)" strokeWidth={2} />
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
                  Latest News
                </h2>
              </div>
              <p className="text-base md:text-lg text-muted-foreground">
                Stay updated with conservation efforts, wildlife sightings, and MTR developments
              </p>
            </div>

            <div className="space-y-6">
              {newsUpdates?.map((news) =>
              <div
                key={news?.id}
                className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border transition-organic hover:shadow-xl hover-lift cursor-pointer"
                onClick={() => onNewsClick(news)}>

                  <div className="grid md:grid-cols-5 gap-0">
                    <div className="md:col-span-2 relative h-48 md:h-full overflow-hidden">
                      <Image
                      src={news?.image}
                      alt={news?.imageAlt}
                      className="w-full h-full object-cover transition-organic hover:scale-105" />

                    </div>

                    <div className="md:col-span-3 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                          {news?.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{news?.date}</span>
                      </div>

                      <h3 className="text-lg md:text-xl font-heading font-bold text-foreground mb-3 line-clamp-2">
                        {news?.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {news?.excerpt}
                      </p>

                      <div className="flex items-center gap-2 text-primary text-sm font-medium">
                        <span>Read More</span>
                        <Icon name="ArrowRight" size={16} strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                iconName="Newspaper"
                iconPosition="left">

                View All News Updates
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16 bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 rounded-2xl p-8 md:p-12 text-center border border-border">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Leaf" size={32} strokeWidth={2} />
            </div>
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              Join Our Conservation Mission
            </h3>
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Every booking, adoption, and donation directly supports wildlife conservation, habitat protection, and community education at Mudumalai Tiger Reserve
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                iconName="Heart"
                iconPosition="left"
                onClick={() => window.location.href = '/e-shop'}>

                Support Conservation
              </Button>
              <Button
                variant="outline"
                size="lg"
                iconName="Info"
                iconPosition="left">

                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default ConservationSpotlight;