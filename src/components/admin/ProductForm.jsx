import React from 'react';

export default function ProductForm({ initialData = {}, onSubmit, onCancel, submitting = false }) {
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

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

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

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  const Field = ({ label, children }) => (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );

  const Input = (props) => (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${props.className || 'border-gray-300'}`}
    />
  );

  const Textarea = (props) => (
    <textarea
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Identity">
        <Field label="Title">
          <Input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Dell Latitude 7400"
          />
        </Field>
        <Field label="Brand">
          <Input
            value={form.brand}
            onChange={(e) => update('brand', e.target.value)}
            placeholder="Dell"
          />
        </Field>
        <Field label="Model">
          <Input
            value={form.model}
            onChange={(e) => update('model', e.target.value)}
            placeholder="Latitude 7400"
          />
        </Field>
        <Field label="SKU">
          <Input
            value={form.sku}
            onChange={(e) => update('sku', e.target.value)}
            placeholder="DEL-L7400-i5-16-512"
          />
        </Field>
      </Section>

      <Section title="Specifications">
        <Field label="CPU">
          <Input
            value={form.cpu}
            onChange={(e) => update('cpu', e.target.value)}
            placeholder="Intel Core i5-8365U"
          />
        </Field>
        <Field label="GPU">
          <Input
            value={form.gpu}
            onChange={(e) => update('gpu', e.target.value)}
            placeholder="Intel UHD 620 / GTX 1650"
          />
        </Field>
        <Field label="RAM (GB)">
          <Input
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

      <Section title="Display">
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

      <Section title="Battery & Condition">
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

      <Section title="Pricing & Availability">
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
            placeholder="29"
          />
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

      <Section title="Content & SEO">
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

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
