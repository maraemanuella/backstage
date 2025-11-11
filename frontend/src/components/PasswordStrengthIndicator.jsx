import { useEffect, useState } from 'react';

export default function PasswordStrengthIndicator({ password, showRequirements = true }) {
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    setRequirements({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;~`]/.test(password),
    });
  }, [password]);

  const allValid = Object.values(requirements).every(req => req);
  const validCount = Object.values(requirements).filter(req => req).length;

  const getStrengthColor = () => {
    if (validCount === 0) return 'bg-gray-200';
    if (validCount <= 2) return 'bg-red-500';
    if (validCount <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (validCount === 0) return '';
    if (validCount <= 2) return 'Fraca';
    if (validCount <= 4) return 'Média';
    return 'Forte';
  };

  if (!password && !showRequirements) return null;

  return (
    <div className="mt-3 space-y-2">
      {password && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-600">Força da senha:</span>
            <span className={`text-xs font-semibold ${
              validCount <= 2 ? 'text-red-600' : 
              validCount <= 4 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {getStrengthText()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${(validCount / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {showRequirements && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">A senha deve conter:</p>
          <ul className="space-y-1">
            <RequirementItem met={requirements.minLength} text="Mínimo 8 caracteres" />
            <RequirementItem met={requirements.hasUpperCase} text="Pelo menos uma letra maiúscula (A-Z)" />
            <RequirementItem met={requirements.hasLowerCase} text="Pelo menos uma letra minúscula (a-z)" />
            <RequirementItem met={requirements.hasNumber} text="Pelo menos um número (0-9)" />
            <RequirementItem met={requirements.hasSpecialChar} text="Pelo menos um caractere especial (!@#$%...)" />
          </ul>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
        met ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
      }`}>
        {met ? '✓' : '○'}
      </span>
      <span className={met ? 'text-green-700 font-medium' : 'text-gray-600'}>
        {text}
      </span>
    </li>
  );
}

