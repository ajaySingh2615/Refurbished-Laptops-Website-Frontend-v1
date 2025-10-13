import React from 'react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

// Individual input component that doesn't re-render
const StableInput = React.memo(
  ({ value, onChange, placeholder, type = 'text', className, ...props }) => {
    return (
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        className={cn(
          'h-11 bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-md focus:shadow-blue-500/20 transition-all duration-300 text-slate-700 placeholder:text-slate-400',
          className,
        )}
        {...props}
      />
    );
  },
);

// Individual textarea component that doesn't re-render
const StableTextarea = React.memo(
  ({ value, onChange, placeholder, rows = 3, className, ...props }) => {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-md focus:shadow-blue-500/20 transition-all duration-300 text-slate-700 placeholder:text-slate-400 resize-none',
          className,
        )}
        {...props}
      />
    );
  },
);

export default function ProductForm({ initialData = {}, onSubmit, onCancel, submitting = false }) {
  const formRef = React.useRef(null);
  const [form, setForm] = React.useState({
    title: '',
    brand: '',
    model: '',
    sku: '',
    cpu: '',
    gpu: '',
    ramGb: '',
    storage: '',
    ports: '',
    os: '',
    keyboardLayout: '',
    color: '',
    weightKg: '',
    dimensionsMm: '',
    displaySizeInches: '',
    displayResolution: '',
    displayPanel: '',
    displayRefreshHz: '',
    brightnessNits: '',
    batteryHealthPct: '',
    batteryCycles: '',
    condition: 'Refurbished-A',
    cosmeticNotes: '',
    functionalNotes: '',
    mrp: '',
    price: '',
    discountPercent: '',
    gstPercent: 18,
    inStock: true,
    stockQty: 0,
    fulfillmentLocation: '',
    warrantyMonths: '',
    returnWindowDays: '',
    highlights: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ...initialData,
  });

  const update = React.useCallback((k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
  }, []);

  // Auto-calculate discount percentage when MRP or Price changes
  React.useEffect(() => {
    const mrp = parseFloat(form.mrp) || 0;
    const price = parseFloat(form.price) || 0;

    console.log('ProductForm - Pricing change detected:', { mrp, price });

    if (mrp > 0 && price > 0 && mrp > price) {
      const discountPercent = ((mrp - price) / mrp) * 100;
      console.log('ProductForm - Discount calculated:', discountPercent.toFixed(2) + '%');
      setForm((s) => ({ ...s, discountPercent: discountPercent.toFixed(2) }));
    } else {
      console.log('ProductForm - Discount cleared');
      setForm((s) => ({ ...s, discountPercent: '' }));
    }
  }, [form.mrp, form.price]);

  // Use useRef to store handlers to prevent re-creation
  const handlersRef = React.useRef({});

  const getHandler = React.useCallback((fieldName) => {
    if (!handlersRef.current[fieldName]) {
      handlersRef.current[fieldName] = (e) => {
        setForm((prev) => ({ ...prev, [fieldName]: e.target.value }));
      };
    }
    return handlersRef.current[fieldName];
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      ramGb: form.ramGb ? Number(form.ramGb) : null,
      weightKg: form.weightKg ? Number(form.weightKg) : null,
      displaySizeInches: form.displaySizeInches ? Number(form.displaySizeInches) : null,
      displayRefreshHz: form.displayRefreshHz ? Number(form.displayRefreshHz) : null,
      brightnessNits: form.brightnessNits ? Number(form.brightnessNits) : null,
      batteryHealthPct: form.batteryHealthPct ? Number(form.batteryHealthPct) : null,
      batteryCycles: form.batteryCycles ? Number(form.batteryCycles) : null,
      mrp: form.mrp ? Number(form.mrp) : null,
      price: form.price ? Number(form.price) : null,
      discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
      gstPercent: form.gstPercent ? Number(form.gstPercent) : 18,
      stockQty: form.stockQty ? Number(form.stockQty) : 0,
      warrantyMonths: form.warrantyMonths ? Number(form.warrantyMonths) : null,
      returnWindowDays: form.returnWindowDays ? Number(form.returnWindowDays) : null,
    };
    onSubmit && onSubmit(payload);
  };

  const Section = React.memo(({ title, children }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
  ));

  const Field = React.memo(({ label, children, required = false }) => (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {children}
    </label>
  ));

  const FormInput = React.memo(({ value, onChange, ...props }) => (
    <Input
      value={value}
      onChange={onChange}
      {...props}
      className={cn(
        'h-11 bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-md focus:shadow-blue-500/20 transition-all duration-300 text-slate-700 placeholder:text-slate-400',
        props.className,
      )}
    />
  ));

  const Textarea = React.memo(({ value, onChange, ...props }) => (
    <textarea
      value={value}
      onChange={onChange}
      {...props}
      className="w-full h-24 px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-md focus:shadow-blue-500/20 transition-all duration-300 text-slate-700 placeholder:text-slate-400 resize-none"
    />
  ));

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <Section key="identity-section" title="Identity">
        <Field label="Title" required>
          <FormInput
            value={form.title}
            onChange={getHandler('title')}
            placeholder="Dell Latitude 7400"
          />
        </Field>
        <Field label="Brand" required>
          <FormInput value={form.brand} onChange={getHandler('brand')} placeholder="Dell" />
        </Field>
        <Field label="Model" required>
          <FormInput
            value={form.model}
            onChange={getHandler('model')}
            placeholder="Latitude 7400"
          />
        </Field>
        <Field label="SKU" required>
          <FormInput
            value={form.sku}
            onChange={getHandler('sku')}
            placeholder="DEL-L7400-i5-16-512"
          />
        </Field>
      </Section>

      <Section key="specifications-section" title="Specifications">
        <Field label="CPU" required>
          <FormInput
            value={form.cpu}
            onChange={(e) => update('cpu', e.target.value)}
            placeholder="Intel Core i5-8365U"
          />
        </Field>
        <Field label="GPU">
          <FormInput
            value={form.gpu}
            onChange={(e) => update('gpu', e.target.value)}
            placeholder="Intel UHD 620 / GTX 1650"
          />
        </Field>
        <Field label="RAM (GB)" required>
          <FormInput
            type="number"
            value={form.ramGb}
            onChange={(e) => update('ramGb', e.target.value)}
            placeholder="16"
          />
        </Field>
        <Field label="Storage">
          <Input
            value={form.storage}
            onChange={(e) => update('storage', e.target.value)}
            placeholder="512GB SSD NVMe"
          />
        </Field>
        <Field label="Ports">
          <Input
            value={form.ports}
            onChange={(e) => update('ports', e.target.value)}
            placeholder="2x USB-A, 2x USB-C TB3, HDMI, uSD, Audio"
          />
        </Field>
        <Field label="OS">
          <Input
            value={form.os}
            onChange={(e) => update('os', e.target.value)}
            placeholder="Windows 11 Pro"
          />
        </Field>
        <Field label="Keyboard Layout">
          <Input
            value={form.keyboardLayout}
            onChange={(e) => update('keyboardLayout', e.target.value)}
            placeholder="EN-IN"
          />
        </Field>
        <Field label="Color">
          <Input
            value={form.color}
            onChange={(e) => update('color', e.target.value)}
            placeholder="Silver"
          />
        </Field>
        <Field label="Weight (kg)">
          <Input
            type="number"
            step="0.01"
            value={form.weightKg}
            onChange={(e) => update('weightKg', e.target.value)}
            placeholder="1.35"
          />
        </Field>
        <Field label="Dimensions (mm)">
          <Input
            value={form.dimensionsMm}
            onChange={(e) => update('dimensionsMm', e.target.value)}
            placeholder="321 x 214 x 17"
          />
        </Field>
      </Section>

      <Section key="display-section" title="Display">
        <Field label="Size (inches)">
          <Input
            type="number"
            step="0.1"
            value={form.displaySizeInches}
            onChange={(e) => update('displaySizeInches', e.target.value)}
            placeholder="14.0"
          />
        </Field>
        <Field label="Resolution">
          <Input
            value={form.displayResolution}
            onChange={(e) => update('displayResolution', e.target.value)}
            placeholder="1920x1080"
          />
        </Field>
        <Field label="Panel">
          <Input
            value={form.displayPanel}
            onChange={(e) => update('displayPanel', e.target.value)}
            placeholder="IPS"
          />
        </Field>
        <Field label="Refresh (Hz)">
          <Input
            type="number"
            value={form.displayRefreshHz}
            onChange={(e) => update('displayRefreshHz', e.target.value)}
            placeholder="60"
          />
        </Field>
        <Field label="Brightness (nits)">
          <Input
            type="number"
            value={form.brightnessNits}
            onChange={(e) => update('brightnessNits', e.target.value)}
            placeholder="300"
          />
        </Field>
      </Section>

      <Section key="battery-condition-section" title="Battery & Condition">
        <Field label="Battery Health (%)">
          <Input
            type="number"
            value={form.batteryHealthPct}
            onChange={(e) => update('batteryHealthPct', e.target.value)}
            placeholder="88"
          />
        </Field>
        <Field label="Battery Cycles">
          <Input
            type="number"
            value={form.batteryCycles}
            onChange={(e) => update('batteryCycles', e.target.value)}
            placeholder="220"
          />
        </Field>
        <Field label="Condition">
          <select
            value={form.condition}
            onChange={(e) => update('condition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Refurbished-A">Refurbished A</option>
            <option value="Refurbished-B">Refurbished B</option>
            <option value="Refurbished-C">Refurbished C</option>
            <option value="Used">Used</option>
          </select>
        </Field>
        <Field label="Cosmetic Notes">
          <Textarea
            rows={2}
            value={form.cosmeticNotes}
            onChange={(e) => update('cosmeticNotes', e.target.value)}
            placeholder="Minor hairline marks on lid"
          />
        </Field>
        <Field label="Functional Notes">
          <Textarea
            rows={2}
            value={form.functionalNotes}
            onChange={(e) => update('functionalNotes', e.target.value)}
            placeholder="Fully tested, battery replaced"
          />
        </Field>
      </Section>

      <Section key="pricing-availability-section" title="Pricing & Availability">
        <Field label="MRP (₹)">
          <Input
            type="number"
            value={form.mrp}
            onChange={(e) => update('mrp', e.target.value)}
            placeholder="64999"
          />
        </Field>
        <Field label="Price (₹)">
          <Input
            type="number"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="45999"
          />
        </Field>
        <Field label="Discount (%)">
          <Input
            type="number"
            value={form.discountPercent}
            onChange={(e) => update('discountPercent', e.target.value)}
            placeholder="Auto-calculated"
            readOnly
            className="bg-slate-50 text-slate-600"
          />
          <p className="text-xs text-slate-500 mt-1">Automatically calculated from MRP and Price</p>
        </Field>
        <Field label="GST (%)">
          <Input
            type="number"
            value={form.gstPercent}
            onChange={(e) => update('gstPercent', e.target.value)}
            placeholder="18"
          />
        </Field>
        <Field label="In Stock">
          <select
            value={String(form.inStock)}
            onChange={(e) => update('inStock', e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </Field>
        <Field label="Stock Qty">
          <Input
            type="number"
            value={form.stockQty}
            onChange={(e) => update('stockQty', e.target.value)}
            placeholder="12"
          />
        </Field>
        <Field label="Ships From">
          <Input
            value={form.fulfillmentLocation}
            onChange={(e) => update('fulfillmentLocation', e.target.value)}
            placeholder="Delhi"
          />
        </Field>
        <Field label="Warranty (months)">
          <Input
            type="number"
            value={form.warrantyMonths}
            onChange={(e) => update('warrantyMonths', e.target.value)}
            placeholder="6"
          />
        </Field>
        <Field label="Return Window (days)">
          <Input
            type="number"
            value={form.returnWindowDays}
            onChange={(e) => update('returnWindowDays', e.target.value)}
            placeholder="7"
          />
        </Field>
      </Section>

      <Section key="content-seo-section" title="Content & SEO">
        <div className="md:col-span-2">
          <Field label="Highlights (one per line)">
            <Textarea
              rows={3}
              value={form.highlights}
              onChange={(e) => update('highlights', e.target.value)}
              placeholder={'14" FHD IPS\nThunderbolt 3\nBacklit keyboard'}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Description">
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Long description..."
            />
          </Field>
        </div>
        <Field label="Meta Title">
          <Input value={form.metaTitle} onChange={(e) => update('metaTitle', e.target.value)} />
        </Field>
        <Field label="Meta Description">
          <Input
            value={form.metaDescription}
            onChange={(e) => update('metaDescription', e.target.value)}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Meta Keywords">
            <Input
              value={form.metaKeywords}
              onChange={(e) => update('metaKeywords', e.target.value)}
              placeholder="comma, separated, keywords"
            />
          </Field>
        </div>
      </Section>

      <div className="flex justify-end gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6 py-3 h-12 border-2 border-slate-200/60 hover:border-slate-300/60 hover:bg-slate-50/80 transition-all duration-300"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="relative inline-flex items-center gap-3 px-8 py-3 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 border-0 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Animated background effect */}
          {!submitting && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
          )}

          {/* Loading spinner or icon */}
          {submitting ? (
            <div className="relative flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : (
            <div className="relative flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <svg
                  className="h-3 w-3 text-white group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>Save Product</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
