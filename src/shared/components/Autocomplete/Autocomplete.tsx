import { useState, useLayoutEffect, memo } from 'react'
import TextField from '@mui/material/TextField'
import MuiAutocomplete, { createFilterOptions } from '@mui/material/Autocomplete'

export type TOption = {
  inputValue?: string;
  label: string;
  value: string;
  isNew?: boolean;
  _id?: number;
}
type TProps = {
  size?: 'small';
  label: string;
  list: TOption[];
  onSelect: (item: TOption | null) => void;
  defaultValue?: TOption;
  isErrored?: boolean;
  helperText?: string;
  isCreatable?: boolean;
  disableClearable?: boolean;
}

const filter = createFilterOptions<TOption>()

export const Autocomplete = memo(({
  size,
  label,
  list,
  onSelect,
  defaultValue,
  isErrored,
  helperText,
  isCreatable,
  disableClearable,
}: TProps) => {
  const [selectedOption, setSelectedOption] = useState<TOption | null>(defaultValue || null)

  useLayoutEffect(() => {
    onSelect(selectedOption)
  }, [selectedOption, onSelect])

  return (
    <MuiAutocomplete
      size={size}
      disableClearable={disableClearable}
      value={selectedOption?.label}
      onChange={(_event, newValue) => {
        switch (true) {
          case typeof newValue === 'string':
            setSelectedOption({
              value: newValue,
              label: newValue,
            })
            break
          case typeof newValue !== 'string' && !!newValue?.inputValue: {
            // Create a new value from the user input
            const option: TOption = {
              label: newValue.inputValue,
              value: newValue.value || newValue.inputValue,
              _id: newValue._id,
            }
            // if (newValue.isNew) option.isNew = true
            setSelectedOption(option)
            break
          }
          default:
            setSelectedOption(newValue)
            break
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.label);
        if (isCreatable && inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            label: `Add "${inputValue}"`,
            value: inputValue,
            _id: new Date().getTime(),
            isNew: true,
          })
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id='free-solo-with-text-demo'
      options={list}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') return option

        // Add "xxx" option created dynamically
        if (option.inputValue) return option.inputValue

        // Regular option
        return option.label;
      }}
      renderOption={(props, option) => <li {...props} key={option.value}>{option.label}</li>}
      // sx={{ width: '100%' }}
      freeSolo
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={isErrored}
          helperText={helperText}
        />
      )}
    />
  );
})
