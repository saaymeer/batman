import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { createRequest } from '@/services/requestService';
import { ISSUE_TYPES } from '@/utils/statusConfig';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import LocationPicker from '@/components/customer/LocationPicker';
import { Zap, Battery, HelpCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';

const ISSUE_ICONS = {
  jumpstart: <Zap className="h-5 w-5" />,
  replacement: <Battery className="h-5 w-5" />,
  unsure: <HelpCircle className="h-5 w-5" />,
};

function validate(fields) {
  const errors = {};
  if (!fields.customerName.trim()) errors.customerName = 'Name is required.';
  if (!fields.customerPhone.trim()) {
    errors.customerPhone = 'Mobile number is required.';
  } else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(fields.customerPhone.trim())) {
    errors.customerPhone = 'Enter a valid mobile number.';
  }
  if (!fields.vehicleMake.trim()) errors.vehicleMake = 'Vehicle make is required.';
  if (!fields.vehicleModel.trim()) errors.vehicleModel = 'Vehicle model is required.';
  if (!fields.issueType) errors.issueType = 'Please select an issue type.';
  return errors;
}

export default function RequestForm() {
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    customerName: '',
    customerPhone: '',
    vehicleMake: '',
    vehicleModel: '',
    plate: '',
    issueType: '',
    notes: '',
  });
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const set = (key) => (e) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const id = await createRequest({
        ...fields,
        location: location
          ? { lat: location.lat, lng: location.lng, accuracy: location.accuracy }
          : null,
        addressText: location?.addressText || '',
      });
      navigate(`/track/${id}`);
    } catch (err) {
      console.error(err);
      setErrors({ form: 'Something went wrong. Please try again.' });
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Contact info */}
      <div className="flex flex-col gap-4">
        <Input
          id="customerName"
          label="Your name"
          placeholder="e.g. Juan dela Cruz"
          value={fields.customerName}
          onChange={set('customerName')}
          error={errors.customerName}
          autoComplete="name"
        />
        <Input
          id="customerPhone"
          label="Mobile number"
          type="tel"
          placeholder="e.g. 09XX XXX XXXX"
          value={fields.customerPhone}
          onChange={set('customerPhone')}
          error={errors.customerPhone}
          autoComplete="tel"
          inputMode="tel"
        />
      </div>

      {/* Vehicle info */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-fog font-display">Vehicle</p>
        <div className="flex gap-2">
          <Input
            id="vehicleMake"
            placeholder="Make (e.g. Toyota)"
            value={fields.vehicleMake}
            onChange={set('vehicleMake')}
            error={errors.vehicleMake}
            className="flex-1"
          />
          <Input
            id="vehicleModel"
            placeholder="Model (e.g. Vios)"
            value={fields.vehicleModel}
            onChange={set('vehicleModel')}
            error={errors.vehicleModel}
            className="flex-1"
          />
        </div>
        <Input
          id="plate"
          label=""
          placeholder="Plate number (optional)"
          value={fields.plate}
          onChange={set('plate')}
          className="mt-1"
        />
      </div>

      {/* Issue type */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-fog font-display">What do you need?</p>
        <div className="flex flex-col gap-2">
          {Object.entries(ISSUE_TYPES).map(([key, { label }]) => {
            const selected = fields.issueType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFields((p) => ({ ...p, issueType: key }))}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl border text-left',
                  'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal',
                  selected
                    ? 'border-signal bg-signal/10 text-signal'
                    : 'border-white/10 bg-ink text-fog hover:border-white/25 hover:text-mist',
                ].join(' ')}
              >
                <span className={selected ? 'text-signal' : 'text-fog'}>
                  {ISSUE_ICONS[key]}
                </span>
                <span className="font-medium font-display text-sm">{label}</span>
                {selected && (
                  <span className="ml-auto text-signal">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.issueType && (
          <p className="text-xs text-alert animate-fade-in">{errors.issueType}</p>
        )}
      </div>

      {/* Location */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setLocationOpen((o) => !o)}
          className="flex items-center justify-between w-full text-sm font-medium text-fog font-display hover:text-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded px-1"
        >
          <span className="flex items-center gap-2">
            📍
            <span>
              {location ? 'Location captured ✓' : 'Set your location (tap to expand)'}
            </span>
          </span>
          {locationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {locationOpen && (
          <div className="animate-slide-up">
            <LocationPicker onChange={setLocation} />
          </div>
        )}
      </div>

      {/* Notes */}
      <Input
        id="notes"
        as="textarea"
        label="Additional notes (optional)"
        placeholder="e.g. I'm on the shoulder of N. Bacalso Ave, near 7-Eleven"
        value={fields.notes}
        onChange={set('notes')}
        rows={3}
        className="resize-none"
      />

      {/* Form error */}
      {errors.form && (
        <p className="text-sm text-alert text-center animate-fade-in">{errors.form}</p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="xl"
        loading={submitting}
        className="w-full mt-2 font-display"
        id="submit-request-btn"
      >
        <Send className="h-6 w-6" />
        Send request
      </Button>
    </form>
  );
}
