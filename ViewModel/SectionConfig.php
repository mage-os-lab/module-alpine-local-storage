<?php
declare(strict_types=1);

namespace MageOS\AlpineLocalStorage\ViewModel;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\View\Element\Block\ArgumentInterface;

class SectionConfig implements ArgumentInterface
{
    public function __construct(
        private readonly ScopeConfigInterface $scopeConfig,
    ) {
    }

    public function getSectionDataLifeTime(): int
    {
        return (int)$this->scopeConfig->getValue('customer/online_customers/section_data_lifetime');
    }
}
