document.addEventListener('alpine:init', () => {
    Alpine.store('LocalStorage', {
        key: 'mage-cache-storage',
        sectionLifetime: window.ALPINE_SECTION_LIFETIME,
        data: {},
        init() {
            document.addEventListener('localStorageUpdate', (event) => {
                if (event.detail.key !== this.key) {
                    return;
                }

                this.data = JSON.parse(event.detail.value);
            });

            const storedData = localStorage.getItem(this.key);
            this.data = storedData ? JSON.parse(storedData) : {};

            if (!this.data) {
                this.refresh();
            }

            let changed = false;
            const cookieSections = MageCookies.get('section_data_ids') || {};

            Object.entries(this.data).forEach(([key, value]) => {
                let sectionTime = parseInt(value.data_id);
                if (this.sectionLifetime > 0) {
                    sectionTime = sectionTime + this.sectionLifetime;
                }

                const isSectionExpired = !value.data_id || sectionTime < this.getCurrentTimestamp();
                const isCookieSectionExpired = cookieSections[key] && cookieSections[key] + this.sectionLifetime < this.getCurrentTimestamp();

                if (isSectionExpired || isCookieSectionExpired) {
                    delete this.data[key];
                    changed = true;
                }
            })

            if (changed) {
                localStorage.setItem(this.key, JSON.stringify(this.data), true);
            }

            document.dispatchEvent(new CustomEvent('localstorage-store:init', {}));
        },
        getNewSectionLifetime() {
            return this.getCurrentTimestamp() + this.sectionLifetime;
        },
        getCurrentTimestamp() {
            return Math.floor(Date.now() / 1000);
        },
        save() {
            localStorage.setItem(this.key, JSON.stringify(this.data), true);
        },
        refresh(sections, forceNewSectionTimestamp) {
            let url = new URL(BASE_URL + '/customer/section/load');
            if (sections) {
                url.searchParams.append('sections', sections);
            }

            forceNewSectionTimestamp = !!forceNewSectionTimestamp;
            if (forceNewSectionTimestamp) {
                url.searchParams.append('force_new_section_timestamp', 'true');
                url.searchParams.append('_', Math.floor(Date.now() / 1000));
            }

            fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((response) => {
                    return response.json();
                })
                .then(newData => {
                    if (typeof newData === 'object') {
                        this.data = Object.assign(this.data, newData);
                        this.save();
                    }
                })
        },
        get(key) {
            if (!this.data) {
                return {};
            }

            if (key === undefined) {
                return this.data;
            }

            if (!this.data[key]) {
                this.refresh(key);
            }

            return this.data[key];
        },
        set(key, value) {
            this.data[key] = value;
            this.save();
        },
        remove(key) {
            if (key !== undefined) {
                delete this.data[key];
                this.save();
            }
        },
        reset() {
            this.data = {};
            localStorage.removeItem(this.key);
        }
    });
});

const originalLocalStorageSetItem = localStorage.setItem;
localStorage.setItem = function(key, value, skipEvent) {
    if (!skipEvent) {
        document.dispatchEvent(new CustomEvent('localStorageUpdate', {detail: {key, value}}));
    }

    originalLocalStorageSetItem.apply(this, [key, value]);
};
