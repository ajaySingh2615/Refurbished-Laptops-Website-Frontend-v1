import React from 'react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

// Individual input component that doesn't re-render
const StableInput = React.memo(
  ({ defaultValue, name, placeholder, type = 'text', className, ...props }) => {
    return (
      <Input
        defaultValue={defaultValue}
        name={name}
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
  ({ defaultValue, name, placeholder, rows = 3, className, ...props }) => {
    return (
      <textarea
        defaultValue={defaultValue}
        name={name}
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

export default function ProductFormStable({
  initialData = {},
  onSubmit,
  onCancel,
  onValidationError,
  submitting = false,
}) {
  const formRef = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);

      // Client-side validation
      const title = formData.get('title')?.toString().trim();
      const brand = formData.get('brand')?.toString().trim();
      const model = formData.get('model')?.toString().trim();
      const sku = formData.get('sku')?.toString().trim();
      const cpu = formData.get('cpu')?.toString().trim();
      const ramGb = formData.get('ramGb')?.toString().trim();
      const price = formData.get('price')?.toString().trim();

      // Check required fields
      if (!title || !brand || !model || !sku || !cpu || !ramGb || !price) {
        const missingFields = [];
        if (!title) missingFields.push('Title');
        if (!brand) missingFields.push('Brand');
        if (!model) missingFields.push('Model');
        if (!sku) missingFields.push('SKU');
        if (!cpu) missingFields.push('CPU');
        if (!ramGb) missingFields.push('RAM');
        if (!price) missingFields.push('Price');

        const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
        error.type = 'validation';
        throw error;
      }

      // Check field lengths
      const fieldLengths = {
        title: 255,
        brand: 128,
        model: 128,
        sku: 64,
        cpu: 128,
        gpu: 128,
        storage: 128,
        os: 128,
        keyboardLayout: 128,
        color: 64,
        dimensionsMm: 128,
        displayResolution: 64,
        displayPanel: 64,
        condition: 64,
        fulfillmentLocation: 128,
        metaTitle: 255,
        metaDescription: 255,
        metaKeywords: 255,
      };

      for (const [field, maxLength] of Object.entries(fieldLengths)) {
        const value = formData.get(field)?.toString();
        if (value && value.length > maxLength) {
          const error = new Error(
            `The ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field is too long (maximum ${maxLength} characters)`,
          );
          error.type = 'validation';
          error.field = field;
          throw error;
        }
      }

      // Check numeric fields
      const numericFields = [
        'ramGb',
        'weightKg',
        'displaySizeInches',
        'displayRefreshHz',
        'brightnessNits',
        'batteryHealthPct',
        'batteryCycles',
        'mrp',
        'price',
        'discountPercent',
        'gstPercent',
        'stockQty',
        'warrantyMonths',
        'returnWindowDays',
      ];
      for (const field of numericFields) {
        const value = formData.get(field)?.toString();
        if (value && value.trim() && isNaN(Number(value))) {
          const error = new Error(
            `The ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field must be a valid number`,
          );
          error.type = 'validation';
          error.field = field;
          throw error;
        }
      }

      const payload = {
        title: formData.get('title') || '',
        brand: formData.get('brand') || '',
        model: formData.get('model') || '',
        sku: formData.get('sku') || '',
        cpu: formData.get('cpu') || '',
        gpu: formData.get('gpu') || '',
        ramGb: formData.get('ramGb') ? Number(formData.get('ramGb')) : null,
        storage: formData.get('storage') || '',
        ports: formData.get('ports') || '',
        os: formData.get('os') || '',
        keyboardLayout: formData.get('keyboardLayout') || '',
        color: formData.get('color') || '',
        weightKg: formData.get('weightKg') ? Number(formData.get('weightKg')) : null,
        dimensionsMm: formData.get('dimensionsMm') || '',
        displaySizeInches: formData.get('displaySizeInches')
          ? Number(formData.get('displaySizeInches'))
          : null,
        displayResolution: formData.get('displayResolution') || '',
        displayPanel: formData.get('displayPanel') || '',
        displayRefreshHz: formData.get('displayRefreshHz')
          ? Number(formData.get('displayRefreshHz'))
          : null,
        brightnessNits: formData.get('brightnessNits')
          ? Number(formData.get('brightnessNits'))
          : null,
        batteryHealthPct: formData.get('batteryHealthPct')
          ? Number(formData.get('batteryHealthPct'))
          : null,
        batteryCycles: formData.get('batteryCycles') ? Number(formData.get('batteryCycles')) : null,
        condition: formData.get('condition') || 'Refurbished-A',
        cosmeticNotes: formData.get('cosmeticNotes') || '',
        functionalNotes: formData.get('functionalNotes') || '',
        mrp: formData.get('mrp') ? Number(formData.get('mrp')) : null,
        price: formData.get('price') ? Number(formData.get('price')) : null,
        discountPercent: formData.get('discountPercent')
          ? Number(formData.get('discountPercent'))
          : null,
        gstPercent: formData.get('gstPercent') ? Number(formData.get('gstPercent')) : 18,
        inStock: formData.get('inStock') === 'true',
        stockQty: formData.get('stockQty') ? Number(formData.get('stockQty')) : 0,
        fulfillmentLocation: formData.get('fulfillmentLocation') || '',
        warrantyMonths: formData.get('warrantyMonths')
          ? Number(formData.get('warrantyMonths'))
          : null,
        returnWindowDays: formData.get('returnWindowDays')
          ? Number(formData.get('returnWindowDays'))
          : null,
        highlights: formData.get('highlights') || '',
        description: formData.get('description') || '',
        metaTitle: formData.get('metaTitle') || '',
        metaDescription: formData.get('metaDescription') || '',
        metaKeywords: formData.get('metaKeywords') || '',
      };
      onSubmit && onSubmit(payload);
    } catch (error) {
      // Call the validation error handler if provided
      if (onValidationError) {
        onValidationError(error);
      } else {
        // Fallback: re-throw the error
        throw error;
      }
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <Section title="Identity">
        <Field label="Title" required>
          <StableInput
            name="title"
            defaultValue={initialData.title || ''}
            placeholder="Dell Latitude 7400"
          />
        </Field>
        <Field label="Brand" required>
          <StableInput name="brand" defaultValue={initialData.brand || ''} placeholder="Dell" />
        </Field>
        <Field label="Model" required>
          <StableInput
            name="model"
            defaultValue={initialData.model || ''}
            placeholder="Latitude 7400"
          />
        </Field>
        <Field label="SKU" required>
          <StableInput
            name="sku"
            defaultValue={initialData.sku || ''}
            placeholder="DEL-L7400-i5-16-512"
          />
        </Field>
      </Section>

      <Section title="Specifications">
        <Field label="CPU" required>
          <StableInput
            name="cpu"
            defaultValue={initialData.cpu || ''}
            placeholder="Intel Core i5-8365U"
          />
        </Field>
        <Field label="GPU">
          <StableInput
            name="gpu"
            defaultValue={initialData.gpu || ''}
            placeholder="Intel UHD 620 / GTX 1650"
          />
        </Field>
        <Field label="RAM (GB)" required>
          <StableInput
            type="number"
            name="ramGb"
            defaultValue={initialData.ramGb || ''}
            placeholder="16"
          />
        </Field>
        <Field label="Storage">
          <StableInput
            name="storage"
            defaultValue={initialData.storage || ''}
            placeholder="512GB SSD"
          />
        </Field>
        <Field label="Ports">
          <StableInput
            name="ports"
            defaultValue={initialData.ports || ''}
            placeholder="USB-A, USB-C, HDMI, 3.5mm"
          />
        </Field>
        <Field label="OS">
          <StableInput name="os" defaultValue={initialData.os || ''} placeholder="Windows 11 Pro" />
        </Field>
        <Field label="Keyboard Layout">
          <StableInput
            name="keyboardLayout"
            defaultValue={initialData.keyboardLayout || ''}
            placeholder="US QWERTY"
          />
        </Field>
        <Field label="Color">
          <StableInput name="color" defaultValue={initialData.color || ''} placeholder="Silver" />
        </Field>
        <Field label="Weight (kg)">
          <StableInput
            type="number"
            step="0.1"
            name="weightKg"
            defaultValue={initialData.weightKg || ''}
            placeholder="1.5"
          />
        </Field>
        <Field label="Dimensions (mm)">
          <StableInput
            name="dimensionsMm"
            defaultValue={initialData.dimensionsMm || ''}
            placeholder="321 x 214 x 17"
          />
        </Field>
      </Section>

      <Section title="Display">
        <Field label="Size (inches)">
          <StableInput
            type="number"
            step="0.1"
            name="displaySizeInches"
            defaultValue={initialData.displaySizeInches || ''}
            placeholder="14.0"
          />
        </Field>
        <Field label="Resolution">
          <StableInput
            name="displayResolution"
            defaultValue={initialData.displayResolution || ''}
            placeholder="1920x1080"
          />
        </Field>
        <Field label="Panel Type">
          <StableInput
            name="displayPanel"
            defaultValue={initialData.displayPanel || ''}
            placeholder="IPS"
          />
        </Field>
        <Field label="Refresh Rate (Hz)">
          <StableInput
            type="number"
            name="displayRefreshHz"
            defaultValue={initialData.displayRefreshHz || ''}
            placeholder="60"
          />
        </Field>
        <Field label="Brightness (nits)">
          <StableInput
            type="number"
            name="brightnessNits"
            defaultValue={initialData.brightnessNits || ''}
            placeholder="300"
          />
        </Field>
      </Section>

      <Section title="Battery & Condition">
        <Field label="Battery Health (%)">
          <StableInput
            type="number"
            name="batteryHealthPct"
            defaultValue={initialData.batteryHealthPct || ''}
            placeholder="85"
          />
        </Field>
        <Field label="Battery Cycles">
          <StableInput
            type="number"
            name="batteryCycles"
            defaultValue={initialData.batteryCycles || ''}
            placeholder="150"
          />
        </Field>
        <Field label="Condition">
          <select
            name="condition"
            defaultValue={initialData.condition || 'Refurbished-A'}
            className="w-full h-11 px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-md focus:shadow-blue-500/20 transition-all duration-300 text-slate-700"
          >
            <option value="Refurbished-A">Refurbished-A</option>
            <option value="Refurbished-B">Refurbished-B</option>
            <option value="Refurbished-C">Refurbished-C</option>
            <option value="Used">Used</option>
          </select>
        </Field>
        <Field label="Cosmetic Notes">
          <StableTextarea
            name="cosmeticNotes"
            defaultValue={initialData.cosmeticNotes || ''}
            placeholder="Minor scratches on lid"
          />
        </Field>
        <Field label="Functional Notes">
          <StableTextarea
            name="functionalNotes"
            defaultValue={initialData.functionalNotes || ''}
            placeholder="Fully tested, battery replaced"
          />
        </Field>
      </Section>

      <Section title="Pricing & Availability">
        <Field label="MRP (₹)">
          <StableInput
            type="number"
            name="mrp"
            defaultValue={initialData.mrp || ''}
            placeholder="80000"
          />
        </Field>
        <Field label="Price (₹)" required>
          <StableInput
            type="number"
            name="price"
            defaultValue={initialData.price || ''}
            placeholder="45000"
          />
        </Field>
        <Field label="Discount (%)">
          <StableInput
            type="number"
            name="discountPercent"
            defaultValue={initialData.discountPercent || ''}
            placeholder="44"
          />
        </Field>
        <Field label="GST (%)">
          <StableInput
            type="number"
            name="gstPercent"
            defaultValue={initialData.gstPercent || 18}
            placeholder="18"
          />
        </Field>
        <Field label="In Stock">
          <select
            name="inStock"
            defaultValue={initialData.inStock ? 'true' : 'false'}
            className="w-full h-11 px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 rounded-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-md focus:shadow-blue-500/20 transition-all duration-300 text-slate-700"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </Field>
        <Field label="Stock Quantity">
          <StableInput
            type="number"
            name="stockQty"
            defaultValue={initialData.stockQty || 0}
            placeholder="5"
          />
        </Field>
        <Field label="Fulfillment Location">
          <StableInput
            name="fulfillmentLocation"
            defaultValue={initialData.fulfillmentLocation || ''}
            placeholder="Mumbai Warehouse"
          />
        </Field>
        <Field label="Warranty (months)">
          <StableInput
            type="number"
            name="warrantyMonths"
            defaultValue={initialData.warrantyMonths || ''}
            placeholder="12"
          />
        </Field>
        <Field label="Return Window (days)">
          <StableInput
            type="number"
            name="returnWindowDays"
            defaultValue={initialData.returnWindowDays || ''}
            placeholder="7"
          />
        </Field>
      </Section>

      <Section title="Content & SEO">
        <div className="md:col-span-2">
          <Field label="Highlights (one per line)">
            <StableTextarea
              name="highlights"
              defaultValue={initialData.highlights || ''}
              placeholder="Fast SSD storage\nLong battery life\nLightweight design"
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Description">
            <StableTextarea
              name="description"
              defaultValue={initialData.description || ''}
              placeholder="Long description..."
            />
          </Field>
        </div>
        <Field label="Meta Title">
          <StableInput
            name="metaTitle"
            defaultValue={initialData.metaTitle || ''}
            placeholder="Dell Latitude 7400 - Refurbished Laptop"
          />
        </Field>
        <Field label="Meta Description">
          <StableInput
            name="metaDescription"
            defaultValue={initialData.metaDescription || ''}
            placeholder="Buy refurbished Dell Latitude 7400 laptop..."
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Meta Keywords">
            <StableInput
              name="metaKeywords"
              defaultValue={initialData.metaKeywords || ''}
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
