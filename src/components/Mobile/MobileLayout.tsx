import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  fullScreen?: boolean;
  padding?: boolean;
  scrollable?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  fullScreen = false,
  padding = true,
  scrollable = true
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${fullScreen ? '' : 'lg:p-6'}`}>
      {/* Mobile Header */}
      {(title || subtitle || headerAction) && (
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-16 z-30">
          <div className={`flex items-center justify-between ${padding ? 'p-4' : 'px-4 py-2'}`}>
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">{subtitle}</p>
              )}
            </div>
            {headerAction && (
              <div className="ml-4 flex-shrink-0">{headerAction}</div>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className={`${scrollable ? 'overflow-y-auto' : ''} ${
        fullScreen ? 'h-screen' : 'min-h-[calc(100vh-8rem)]'
      }`}>
        <div className={`${padding ? 'p-4 lg:p-0' : ''} ${fullScreen ? 'h-full' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4
}) => {
  const getGridClasses = () => {
    const classes = [`gap-${gap}`];
    
    if (cols.xs) classes.push(`grid-cols-${cols.xs}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`grid ${getGridClasses()}`}>
      {children}
    </div>
  );
};

// Mobile Card Component
interface MobileCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
  padding?: boolean;
  elevated?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  action,
  padding = true,
  elevated = true,
  clickable = false,
  onClick
}) => {
  const cardClasses = `
    bg-white rounded-lg border border-gray-200
    ${elevated ? 'shadow-sm' : ''}
    ${clickable ? 'hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer' : ''}
  `;

  const CardContent = () => (
    <>
      {(title || subtitle || icon || action) && (
        <div className={`flex items-center justify-between ${padding ? 'p-4 pb-2' : 'p-2'} ${!children ? 'pb-4' : ''}`}>
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {icon && <div className="text-xl">{icon}</div>}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="ml-2">{action}</div>}
        </div>
      )}
      {children && (
        <div className={padding ? 'px-4 pb-4' : 'p-2'}>
          {children}
        </div>
      )}
    </>
  );

  if (clickable && onClick) {
    return (
      <button className={cardClasses} onClick={onClick}>
        <CardContent />
      </button>
    );
  }

  return (
    <div className={cardClasses}>
      <CardContent />
    </div>
  );
};

// Mobile Tabs Component
interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: string;
    badge?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export const MobileTabs: React.FC<MobileTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default'
}) => {
  const getTabClasses = (isActive: boolean) => {
    const baseClasses = 'flex items-center justify-center space-x-2 py-3 px-4 font-medium text-sm transition-colors';
    
    switch (variant) {
      case 'pills':
        return `${baseClasses} rounded-lg ${
          isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`;
      case 'underline':
        return `${baseClasses} border-b-2 ${
          isActive
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`;
      default:
        return `${baseClasses} ${
          isActive
            ? 'bg-primary-50 text-primary-600 border-primary-200'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-32 z-20">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`${getTabClasses(activeTab === tab.id)} relative whitespace-nowrap`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Mobile Floating Action Button
interface MobileFABProps {
  icon: string;
  label?: string;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'danger';
}

export const MobileFAB: React.FC<MobileFABProps> = ({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  size = 'md',
  color = 'primary'
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-20 left-4';
      case 'bottom-center':
        return 'bottom-20 left-1/2 transform -translate-x-1/2';
      default:
        return 'bottom-20 right-4';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12 text-sm';
      case 'lg':
        return 'w-16 h-16 text-xl';
      default:
        return 'w-14 h-14 text-lg';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-primary-600 hover:bg-primary-700';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        fixed z-50 ${getPositionClasses()} ${getSizeClasses()} ${getColorClasses()}
        text-white rounded-full shadow-lg hover:shadow-xl
        flex items-center justify-center transition-all duration-200
        active:scale-95
      `}
      title={label}
    >
      <span>{icon}</span>
    </button>
  );
};

// Mobile Pull to Refresh
interface MobilePullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
}

export const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  children,
  onRefresh,
  isRefreshing = false
}) => {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [startY, setStartY] = React.useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0 && window.scrollY === 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, 100));
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > 50) {
      await onRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull to Refresh Indicator */}
      {isPulling && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary-50 transition-all duration-200"
          style={{ height: pullDistance }}
        >
          <div className="flex items-center space-x-2 text-primary-600">
            <div className={`${isRefreshing ? 'animate-spin' : ''}`}>
              {isRefreshing ? '⟳' : '↓'}
            </div>
            <span className="text-sm font-medium">
              {isRefreshing ? 'Obnovuje se...' : pullDistance > 50 ? 'Pusť pro obnovení' : 'Táhni pro obnovení'}
            </span>
          </div>
        </div>
      )}
      
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  );
};