export const translations = {
  ar: {
    appTitle: 'PixelForge AI',
    appSubtitle: 'أستوديو الصور الذكي والآمن 100% داخل متصفحك',
    privacyBadge: 'أمان وخصوصية 100% - معالجة محلية على حاسوبك بدون رفع للسيرفر',
    privacyVerified: 'بياناتك لا تغادر جهازك أبداً',
    zeroBytesUploaded: '0 بايت تم رفعها للخوادم',
    learnMore: 'كيف يعمل هذا بأمان؟',

    // Nav tabs
    tabConvert: 'تحويل الصيغ',
    tabCompress: 'ضغط الصور',
    tabAI: 'أدوات الذكاء الاصطناعي',
    tabBatch: 'المعالجة الجماعية',

    // Dropzone
    dropTitle: 'اسحب وأفلت الصور هنا، أو اضغط للاختيار',
    dropSubtitle: 'يدعم PNG, JPG, WebP, AVIF, BMP, GIF, SVG | يمكنك أيضاً الضغط على Ctrl+V للصق من الحافظة',
    browseFiles: 'تصفح الملفات',
    processingLocal: 'معالجة محلية فورية في المعالج والذاكرة لجهازك',

    // Formats
    formatPNG: 'PNG (شفافية وجودة فائقة)',
    formatJPG: 'JPG / JPEG (مثالي للصور الفوتوغرافية)',
    formatWEBP: 'WebP (الجيل الحديث والأكثر توفيراً للمواقع)',
    formatAVIF: 'AVIF (أعلى نسبة ضغط وجودة متقدمة)',
    formatBMP: 'BMP (صيغة نقطية غير مضغوطة)',
    formatICO: 'ICO (أيقونات المواقع Favicon المتعددة)',
    formatSVG: 'SVG (تضمين متجهي فائق الدقة)',

    // Actions
    convertBtn: 'تحويل الصورة الآن',
    compressBtn: 'ضغط وتوفير المساحة',
    downloadBtn: 'تحميل الصورة',
    downloadAllBtn: 'تحميل الكل في ملف مضغوط (.ZIP)',
    clearAllBtn: 'مسح الكل',
    applyChanges: 'تطبيق التعديلات',
    resetOriginal: 'استعادة الأصلية',
    compareOriginal: 'مقارنة قبل / بعد',
    processing: 'جاري المعالجة المحلية...',

    // Metrics
    originalSize: 'الحجم الأصلي:',
    newSize: 'الحجم الجديد:',
    savings: 'نسبة التوفير:',
    dimensions: 'الأبعاد:',
    timeElapsed: 'زمن المعالجة:',
    ms: 'مللي ثانية',

    // Compression controls
    compressionQuality: 'مستوى الجودة:',
    qualityDescription: 'اختر التوازن المناسب بين حجم الملف ووضوح الصورة',
    scaleDimensions: 'تغيير الأبعاد (المقياس):',
    keepAspect: 'الحفاظ على نسبة الأبعاد',
    presetMaxSaving: 'أقصى توفير (60%)',
    presetBalanced: 'متوازن ومثالي للمواقع (80%)',
    presetHighQuality: 'جودة فائقة (92%)',
    presetLossless: 'بدون أي فقدان (100%)',

    // AI Tools
    aiToolsTitle: 'تعديلات الذكاء الاصطناعي على جهازك',
    aiBgRemover: 'إزالة الخلفية الذكية',
    aiMagicEraser: 'الممحاة السحرية (إزالة العناصر)',
    aiSuperRes: 'تكبير وتحسين الدقة (Super Resolution)',
    aiAutoEnhance: 'تحسين تلقائي ذكي',
    aiFilters: 'فلاتر سينمائية وذكية',
    aiAdjust: 'تعديلات الألوان والإضاءة',

    // AI Details
    bgModeTransparent: 'خلفية شفافة (PNG)',
    bgModeColor: 'لون مخصص',
    bgModeBlur: 'تمويه الخلفية الأصلية',
    eraserHint: 'ارسم بالفرشاة فوق العنصر أو العيب الذي تريد إزالته، وسيقوم الذكاء الاصطناعي بإعادة بناء المكان محلياً.',
    brushSize: 'حجم الفرشاة:',
    eraseAction: 'إزالة العنصر الآن',
    clearMask: 'مسح التحديد',
    upscale2x: 'تكبير بمقدار 2X (مضاعفة الدقة)',
    upscale4x: 'تكبير بمقدار 4X (فائق الوضوح)',
    autoEnhanceHint: 'تعديل ديناميكي لتباين الألوان، تفاصيل الظلال، والتشبع بضغطة زر واحدة.',
    
    // Privacy Modal
    modalTitle: 'درع الأمان والخصوصية: كيف نضمن حماية صورك بنسبة 100%؟',
    modalP1: 'معظم مواقع تحويل وضغط الصور على الإنترنت تقوم برفع صورك الشخصية إلى خوادمها البعيدة (Cloud Servers)، مما قد يعرض خصوصيتك للخطر أو تسريب بياناتك.',
    modalP2: 'موقع **PixelForge AI** يعتمد على أحدث تقنيات الويب الحديثة (WebAssembly و HTML5 Canvas و Web Workers):',
    modalFeature1Title: '🔒 خصوصية مطلقة 100%:',
    modalFeature1Desc: 'تتم كافة العمليات الحسابية والتحويل والضغط والذكاء الاصطناعي داخل متصفحك مباشرة. لا يتم رفع بايت واحد إلى أي خادم خارجي.',
    modalFeature2Title: '⚡ سرعة البرق بدون انقطاع:',
    modalFeature2Desc: 'لا تحتاج لانتظار رفع الملفات (Upload) أو تنزيلها (Download). المعالجة فورية وتعتمد على قوة معالج جهازك.',
    modalFeature3Title: '🌐 يعمل بدون إنترنت (Offline Ready):',
    modalFeature3Desc: 'يمكنك قطع اتصالك بالإنترنت بالكامل وسيستمر الموقع بالعمل بكفاءة تامة.',
    modalFeature4Title: '♾️ بلا حدود أو رسوم خفية:',
    modalFeature4Desc: 'حوّل واضغط مئات الصور بدون أي قيود أو اشتراكات شهرية، لأنك تستخدم موارد جهازك.',
    closeModal: 'فهمت، استمر في الاستخدام الآمن',
    
    // Toast & Status
    batchDone: 'تمت معالجة جميع الصور بنجاح محلياً!',
    copied: 'تم النسخ بنجاح!',
    noImagesYet: 'لم تقم بإضافة أي صور بعد',
    addImagesToStart: 'أضف صورك في الأعلى للبدء فوراً في التحويل أو الضغط أو التعديل الذكي'
  },
  en: {
    appTitle: 'PixelForge AI',
    appSubtitle: '100% Private, On-Device AI Image Studio in Your Browser',
    privacyBadge: '100% Private & Secure — Processed locally on your machine, zero server uploads',
    privacyVerified: 'Your photos never leave your device',
    zeroBytesUploaded: '0 Bytes uploaded to servers',
    learnMore: 'How does this work safely?',

    // Nav tabs
    tabConvert: 'Convert Format',
    tabCompress: 'Compress Images',
    tabAI: 'AI Studio',
    tabBatch: 'Batch Queue',

    // Dropzone
    dropTitle: 'Drag & drop your images here, or click to browse',
    dropSubtitle: 'Supports PNG, JPG, WebP, AVIF, BMP, GIF, SVG | You can also press Ctrl+V to paste from clipboard',
    browseFiles: 'Browse Files',
    processingLocal: 'Processed instantly in your device CPU & GPU memory',

    // Formats
    formatPNG: 'PNG (Transparent & Lossless)',
    formatJPG: 'JPG / JPEG (Best for photos)',
    formatWEBP: 'WebP (Modern web format, high savings)',
    formatAVIF: 'AVIF (Next-gen extreme compression)',
    formatBMP: 'BMP (Uncompressed Bitmap)',
    formatICO: 'ICO (Multi-size Website Favicon)',
    formatSVG: 'SVG (Vectorized / Embedded format)',

    // Actions
    convertBtn: 'Convert Image Now',
    compressBtn: 'Compress & Save Size',
    downloadBtn: 'Download Image',
    downloadAllBtn: 'Download All as ZIP (.zip)',
    clearAllBtn: 'Clear All',
    applyChanges: 'Apply Changes',
    resetOriginal: 'Reset to Original',
    compareOriginal: 'Compare Before / After',
    processing: 'Processing locally...',

    // Metrics
    originalSize: 'Original Size:',
    newSize: 'New Size:',
    savings: 'Savings:',
    dimensions: 'Dimensions:',
    timeElapsed: 'Processing Time:',
    ms: 'ms',

    // Compression controls
    compressionQuality: 'Quality Level:',
    qualityDescription: 'Choose the optimal balance between file size and visual clarity',
    scaleDimensions: 'Scale Dimensions:',
    keepAspect: 'Maintain Aspect Ratio',
    presetMaxSaving: 'Max Savings (60%)',
    presetBalanced: 'Balanced for Web (80%)',
    presetHighQuality: 'High Quality (92%)',
    presetLossless: 'Lossless (100%)',

    // AI Tools
    aiToolsTitle: 'Client-Side AI Enhancements',
    aiBgRemover: 'AI Background Remover',
    aiMagicEraser: 'Magic Object Eraser',
    aiSuperRes: 'AI Super Resolution (2X / 4X)',
    aiAutoEnhance: 'Smart Auto-Enhance',
    aiFilters: 'Cinematic & Neural Filters',
    aiAdjust: 'Color & Lighting Adjustments',

    // AI Details
    bgModeTransparent: 'Transparent Background (PNG)',
    bgModeColor: 'Solid Color',
    bgModeBlur: 'Blur Original Background',
    eraserHint: 'Paint with the brush over unwanted objects or blemishes. The client-side AI will reconstruct the texture seamlessly.',
    brushSize: 'Brush Size:',
    eraseAction: 'Erase Selected Object',
    clearMask: 'Clear Mask',
    upscale2x: '2X Upscale (Double Resolution)',
    upscale4x: '4X Upscale (Ultra Clarity)',
    autoEnhanceHint: 'One-click dynamic range optimization, contrast stretching, and tone mapping.',
    
    // Privacy Modal
    modalTitle: 'Privacy Shield: Why 100% Client-Side Processing Protects You',
    modalP1: 'Most online image converters upload your personal photos to remote cloud servers, putting your privacy and sensitive data at risk.',
    modalP2: 'PixelForge AI harnesses cutting-edge browser technologies (HTML5 Canvas, WebAssembly, Web Workers):',
    modalFeature1Title: '🔒 100% Zero-Cloud Privacy:',
    modalFeature1Desc: 'All algorithms, compression, conversion, and AI processing execute directly in your browser. Not a single byte is uploaded to any server.',
    modalFeature2Title: '⚡ Lightning Fast:',
    modalFeature2Desc: 'No upload or download delays. Execution happens in real-time right on your CPU/GPU.',
    modalFeature3Title: '🌐 Offline Ready:',
    modalFeature3Desc: 'You can disconnect from the internet and the entire suite will continue working without interruption.',
    modalFeature4Title: '♾️ No Limits or Subscriptions:',
    modalFeature4Desc: 'Convert and compress unlimited files for free without arbitrary restrictions.',
    closeModal: 'Understood, keep me safe',
    
    // Toast & Status
    batchDone: 'All images processed successfully on your machine!',
    copied: 'Copied to clipboard!',
    noImagesYet: 'No images uploaded yet',
    addImagesToStart: 'Drop your images above to start converting, compressing, or editing with AI.'
  }
};
