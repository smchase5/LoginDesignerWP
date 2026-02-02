interface Preset {
    name: string
    category: string
    is_pro: boolean
    preview: {
        bg: string
        form_bg: string
        form_border?: string
        input_bg?: string
        button_bg?: string
    }
    settings: Record<string, any>
}

interface LoginDesignerWPData {
    nonce: string
    securityNonce: string
    settings: Record<string, any>
    isPro: boolean
    isProPluginActive?: boolean
    presets: Record<string, Preset>
    assetsUrl: string
    loginUrl: string
    i18n: {
        saved: string
        error: string
    }
    security: {
        enabled: boolean
        method: 'basic' | 'turnstile' | 'recaptcha'
        basic_honeypot: boolean
        basic_min_time: number
        basic_math: boolean
        turnstile_site_key: string
        turnstile_secret: string
        recaptcha_site_key: string
        recaptcha_secret: string
    }
    licenseNonce?: string
    license?: {
        status: string
        key: string
    }
}

declare global {
    interface Window {
        logindesignerwpData: LoginDesignerWPData
        ajaxurl: string
        jQuery: JQueryStatic
        wp: {
            media: (options: any) => any
            Backbone: {
                View: any
                [key: string]: any
            }
        }
    }
}

export { }
