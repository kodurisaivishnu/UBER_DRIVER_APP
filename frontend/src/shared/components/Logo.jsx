import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';

export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 40, text: 'text-3xl' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <LocalTaxiIcon sx={{ fontSize: s.icon, color: '#276EF1' }} />
      <span className={`${s.text} font-bold text-uber-black`}>
        Uber<span className="font-light">Driver</span>
      </span>
    </div>
  );
}
