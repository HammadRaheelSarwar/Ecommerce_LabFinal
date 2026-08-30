const mongoose = require('mongoose');

// Singleton document — only one per database
const websiteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'All Available' },
    siteTagline: { type: String, default: 'Everything You Desire, All Available.' },
    logo: { type: String },
    favicon: { type: String },

    // Announcement bar
    announcementBar: {
      isActive: { type: Boolean, default: true },
      messages: [{ type: String }], // multiple messages that cycle
      backgroundColor: { type: String, default: '#D4AF37' },
      textColor: { type: String, default: '#050505' },
    },

    // Contact info
    contact: {
      email: { type: String },
      phone: { type: String },
      whatsapp: { type: String },
      address: { type: String },
    },

    // Social media
    social: {
      instagram: { type: String },
      facebook: { type: String },
      tiktok: { type: String },
      pinterest: { type: String },
      twitter: { type: String },
    },

    // Shipping
    shipping: {
      freeShippingThreshold: { type: Number, default: 5000 },
      standardShippingCost: { type: Number, default: 200 },
      freeShippingLabel: { type: String, default: 'Free delivery on orders above Rs. 5,000' },
    },

    // Footer
    footer: {
      description: { type: String },
      copyrightText: { type: String, default: '© All Available. All Rights Reserved.' },
      links: [{ label: String, url: String }],
    },

    // SEO defaults
    seo: {
      defaultTitle: { type: String },
      defaultDescription: { type: String },
      ogImage: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);
