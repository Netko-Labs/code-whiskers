import { REVIEWER_PROVIDERS } from '@code-whiskers/studio-domain'
import { NativeSelect, NativeSelectOption } from '@code-whiskers/ui/components/native-select'
import { SettingRow } from '@/components/shared/page'
import { PROVIDER_LABEL, type ReviewerProviderSelectProps } from './lib'

export function ReviewerProviderSelect({
  id,
  label,
  description,
  inheritLabel,
  value,
  onChange,
}: ReviewerProviderSelectProps) {
  return (
    <SettingRow label={label} htmlFor={id} description={description}>
      <NativeSelect id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <NativeSelectOption value="">{inheritLabel}</NativeSelectOption>
        {REVIEWER_PROVIDERS.map((provider) => (
          <NativeSelectOption key={provider} value={provider}>
            {PROVIDER_LABEL[provider]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </SettingRow>
  )
}
