<?php
declare(strict_types=1);

namespace MageOS\AlpineLocalStorage\ViewModel;

use Magento\Framework\Session\Config;
use Magento\Framework\View\Element\Block\ArgumentInterface;

class CookieConfig implements ArgumentInterface
{
    public function __construct(
        private readonly Config $sessionConfig,
    ) {
    }

    public function getLifetime(): int
    {
        return (int)$this->sessionConfig->getCookieLifetime();
    }

    public function getPath(): string
    {
        return (string)$this->sessionConfig->getCookiePath();
    }

    public function getDomain(): string
    {
        $cookieDomain = (string)$this->sessionConfig->getCookieDomain();
        if (!$cookieDomain) {
            return '';
        }

        if (str_starts_with($cookieDomain, '.')) {
            return $cookieDomain;
        }

        return '.' . $cookieDomain;
    }

    public function isHttpOnly(): int
    {
        return (int)$this->sessionConfig->getCookieHttpOnly();
    }

    public function getSameSite(): string
    {
        return 'Lax'; // @todo Strict, Lax or None
    }
}
