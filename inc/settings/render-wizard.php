<?php
/**
 * Render the Inline Design Wizard (Improved 3-Step Flow).
 *
 * LEGACY FILE - Wizard is now implemented in React
 * 
 * This file previously contained 577 lines of PHP/HTML markup for the inline wizard UI.
 * As of the React + Tailwind migration, the wizard is now fully implemented as a React component.
 * 
 * See: assets/src/components/wizard/Wizard.tsx
 * 
 * The wizard is rendered as part of the main admin app (App.tsx) and appears as a modal dialog
 * when the "Start Wizard" button is clicked. All wizard functionality including preset selection,
 * background customization, and logo setup is now handled entirely in React with shadcn/ui components.
 * 
 * This file is kept for backwards compatibility to prevent breaking any require/include statements,
 * but it no longer outputs any markup.
 *
 * @package LoginDesignerWP
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// The wizard UI is now rendered in React. No markup is output from this file.