import React from 'react';
import Icon from '../../../components/AppIcon';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date()?.getFullYear();

  const footerLinks = {
    explore: [
      { label: 'Book Accommodation', path: '/interactive-map-booking' },
      { label: 'Safari Activities', path: '/activity-booking' },
      { label: 'E-Shop', path: '/e-shop' },
      { label: 'My Dashboard', path: '/user-dashboard' }
    ],
    information: [
      { label: 'About MTR', path: '/home-landing' },
      { label: 'Conservation Efforts', path: '/home-landing' },
      { label: 'Educational Center', path: '/home-landing' },
      { label: 'News & Updates', path: '/home-landing' }
    ],
    support: [
      { label: 'Contact Us', path: '/home-landing' },
      { label: 'FAQs', path: '/home-landing' },
      { label: 'Booking Policy', path: '/home-landing' },
      { label: 'Cancellation Policy', path: '/home-landing' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: 'Facebook', url: '#' },
    { name: 'Twitter', icon: 'Twitter', url: '#' },
    { name: 'Instagram', icon: 'Instagram', url: '#' },
    { name: 'Youtube', icon: 'Youtube', url: '#' }
  ];

  const contactInfo = [
    { icon: 'MapPin', text: 'Mudumalai Tiger Reserve, Tamil Nadu, India' },
    { icon: 'Phone', text: '+91 98765 43210' },
    { icon: 'Mail', text: 'info@mtrbookinghub.in' }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12 mb-12">
          <div className="lg:col-span-4">
            <Link to="/home-landing" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon name="Trees" size={28} color="var(--color-primary)" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl text-foreground">MTR BookingHub</span>
                <span className="text-caption text-muted-foreground text-xs">Wildlife Resort</span>
              </div>
            </Link>
            <p className="text-sm md:text-base text-muted-foreground mb-6 max-measure">
              Your gateway to experiencing the magnificent wildlife of Mudumalai Tiger Reserve. Book accommodations, safaris, and support conservation efforts.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks?.map((social) => (
                <a
                  key={social?.name}
                  href={social?.url}
                  className="w-10 h-10 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-organic hover-lift active-press"
                  aria-label={social?.name}
                >
                  <Icon name={social?.icon} size={20} strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading font-bold text-lg text-foreground mb-4">Explore</h3>
            <ul className="space-y-3">
              {footerLinks?.explore?.map((link) => (
                <li key={link?.label}>
                  <Link
                    to={link?.path}
                    className="text-sm md:text-base text-muted-foreground hover:text-primary transition-organic inline-flex items-center gap-2 group"
                  >
                    <Icon name="ChevronRight" size={16} strokeWidth={2} className="transition-organic group-hover:translate-x-1" />
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading font-bold text-lg text-foreground mb-4">Information</h3>
            <ul className="space-y-3">
              {footerLinks?.information?.map((link) => (
                <li key={link?.label}>
                  <Link
                    to={link?.path}
                    className="text-sm md:text-base text-muted-foreground hover:text-primary transition-organic inline-flex items-center gap-2 group"
                  >
                    <Icon name="ChevronRight" size={16} strokeWidth={2} className="transition-organic group-hover:translate-x-1" />
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading font-bold text-lg text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks?.support?.map((link) => (
                <li key={link?.label}>
                  <Link
                    to={link?.path}
                    className="text-sm md:text-base text-muted-foreground hover:text-primary transition-organic inline-flex items-center gap-2 group"
                  >
                    <Icon name="ChevronRight" size={16} strokeWidth={2} className="transition-organic group-hover:translate-x-1" />
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading font-bold text-lg text-foreground mb-4">Contact</h3>
            <ul className="space-y-4">
              {contactInfo?.map((info, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={info?.icon} size={16} color="var(--color-primary)" strokeWidth={2} />
                  </div>
                  <span className="text-sm md:text-base text-muted-foreground">{info?.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Mudumalai Tiger Reserve. All rights reserved. Managed by Tamil Nadu Forest Department.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/home-landing" className="text-sm text-muted-foreground hover:text-primary transition-organic">
                Privacy Policy
              </Link>
              <Link to="/home-landing" className="text-sm text-muted-foreground hover:text-primary transition-organic">
                Terms of Service
              </Link>
              <Link to="/home-landing" className="text-sm text-muted-foreground hover:text-primary transition-organic">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;