export interface FAQ {
	question: string;
	answer: string;
}

export interface LandingPageConfig {
	// SEO
	slug: string;
	title: string;
	metaDescription: string;
	keywords: string;
	canonicalPath: string;

	// Content
	h1: string;
	tagline: string;
	introParagraph: string;

	// Feature focus
	primaryFeature: 'trim' | 'compress' | 'crop' | 'convert' | 'resize' | 'privacy';

	// Default features to enable when user selects a file
	defaultFeatures: {
		trim?: boolean;
		compress?: boolean;
		crop?: boolean;
		formatConversion?: boolean;
		resolutionScaling?: boolean;
		audioAdjustment?: boolean;
	};

	// FAQ section
	faqs: FAQ[];
}
