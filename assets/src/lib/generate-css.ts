export function generatePreviewCSS(s: any): string {
    let css = "/* LoginDesignerWP Preview Styles */\n";

    // Helper to escape output (rudimentary)
    const esc = (v: any) => v || '';

    // Background
    css += "body.login {\n";
    if (s.background_mode === 'solid') {
        css += `    background: ${esc(s.background_color)} !important;\n`;
    } else if (s.background_mode === 'gradient') {
        const type = s.gradient_type || 'linear';
        const angle = s.gradient_angle || 135;
        const pos = s.gradient_position || 'center center';
        const col1 = esc(s.background_gradient_1);
        const col2 = esc(s.background_gradient_2);

        if (type === 'linear') {
            css += `    background: linear-gradient(${angle}deg, ${col1}, ${col2}) !important;\n`;
        } else if (type === 'radial') {
            css += `    background: radial-gradient(circle at ${pos}, ${col1}, ${col2}) !important;\n`;
        } else {
            // fallback
            css += `    background: linear-gradient(135deg, ${col1}, ${col2}) !important;\n`;
        }
    } else if (s.background_mode === 'image' && (s.background_image_url || s.background_image_id)) {
        // Note: We need URL here. settings usually has background_image_id. 
        // In React state we might need to store the URL too when selecting image.
        const url = s.background_image_url || '';
        if (url) {
            css += `    background-color: ${esc(s.background_color)} !important;\n`;
            css += `    background-image: url('${url}') !important;\n`;
            css += `    background-size: cover !important;\n`;
            // We can expand this with more props later (repeat, pos, etc)
            css += `    background-attachment: fixed !important;\n`;
        }
    }
    css += "}\n";

    // Form Container
    css += "body.login div#login form#loginform, body.login div#login form#registerform, body.login div#login form#lostpasswordform {\n";
    css += `    background: ${esc(s.form_bg_color)} !important;\n`;
    css += `    border-radius: ${parseInt(s.form_border_radius || 0)}px !important;\n`;
    css += `    border: 1px solid ${esc(s.form_border_color)} !important;\n`;
    css += `    padding: 26px 24px !important;\n`;
    css += "}\n";

    // Inputs
    css += "body.login div#login input[type='text'], body.login div#login input[type='password'], body.login div#login input[type='email'] {\n";
    css += `    border-radius: 6px !important;\n`;
    css += "}\n"

    // Logo
    css += "#login h1 a {\n";
    if (s.logo_url && s.logo_image_url) { // We ideally need the image URL here
        // If we only have ID, we can't show it easily without fetching
        // But StepLogo saves logo_image_id.
        // We should update StepLogo/StepBackground to also save/store xxx_url in the state for preview.
        css += `    background-image: url('${s.logo_image_url}') !important;\n`;
        css += `    background-size: contain !important;\n`;
    }
    css += "}\n";

    return css;
}
