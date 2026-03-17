import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const AdoptionHistoryCard = ({ adoption }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'completed':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-organic hover:shadow-lg">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-40 h-40 overflow-hidden flex-shrink-0">
          <Image
            src={adoption?.animalImage}
            alt={adoption?.animalImageAlt}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  {adoption?.animalName}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(adoption?.status)}`}>
                  {adoption?.status?.charAt(0)?.toUpperCase() + adoption?.status?.slice(1)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{adoption?.species}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Calendar" size={16} strokeWidth={2} color="var(--color-primary)" />
                  <span className="text-foreground">
                    Adopted: {formatDate(adoption?.adoptionDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Clock" size={16} strokeWidth={2} color="var(--color-primary)" />
                  <span className="text-foreground">
                    Duration: {adoption?.duration}
                  </span>
                </div>
              </div>

              {adoption?.certificateUrl && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <Icon name="Award" size={16} strokeWidth={2} />
                  <span>Certificate Available</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Contribution</p>
              <p className="text-xl font-heading font-bold text-primary">
                {formatCurrency(adoption?.amount)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {adoption?.certificateUrl && (
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
              >
                Download Certificate
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              iconName="Heart"
              iconPosition="left"
            >
              View Updates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionHistoryCard;