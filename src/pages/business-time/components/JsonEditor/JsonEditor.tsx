/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react'
import { JsonEditor as JsonEditorByCarlosNZ } from 'json-edit-react'
import { getValidateResult, NValidate } from '~/shared/utils/getValidateResult'
// import baseClasses from '~/App.module.scss'

type TProps<T> = {
  initialState: T;
  isReadOnly?: boolean;
  validationRules?: NValidate.TRules;
  onValidate?: (arg: {
    validatedResult: NValidate.TResult;
    value: T;
  }) => void;
}
type TCollectionKey = string | number;

const genericMemo: <T>(component: T) => T = memo

function _JsonEditor<T>({ initialState, isReadOnly, validationRules, onValidate }: TProps<T>) {
  // const handleChange = (arg: {
  //   currentData: any;
  //   newValue: any;
  //   currentValue: any;
  //   name: TCollectionKey;
  //   path: TCollectionKey[];
  // }) => {
  //   switch (true) {
  //     case typeof validationRules !== 'undefined':
  //       return arg.newValue
  //     default:
  //       return arg.newValue
  //   }
  // }
  const handleEdit = ({ newData }: {
    currentData: any;
    currentValue: any;
    newData: any;
    newValue: any;
    name: TCollectionKey | undefined;
    path: TCollectionKey[];
  }) => {
    // console.log(newData)
    switch (true) {
      case typeof validationRules !== 'undefined': {
        const validated = getValidateResult({
          rules: validationRules,
          event: newData,
        })
        if (typeof onValidate === 'function') onValidate({
          validatedResult: validated,
          value: newData,
        })
        return validated.ok
      }
      default:
        return true
    }
  }

  return (
    // isReadOnly
    // ? <pre className={baseClasses.preNormalized}>{JSON.stringify(initialState, null, 2)}</pre>
    // : (
    <JsonEditorByCarlosNZ
      viewOnly={isReadOnly}
      data={initialState}
      // onChange={handleChange}
      onEdit={handleEdit}
      enableClipboard={false}
      onDelete={handleEdit}
      onAdd={handleEdit}
      theme={{
        displayName: 'Default',
        fragments: { edit: 'rgb(42, 161, 152)' },
        styles: {
          container: {
            backgroundColor: '#f6f6f6',
            fontFamily: 'monospace',
            fontSize: '13px',
            zIndex: 0,
          },
          collection: {},
          collectionInner: {},
          collectionElement: {},
          dropZone: {},
          property: '#292929',
          bracket: { color: 'rgb(0, 43, 54)', fontWeight: 'bold', },
          itemCount: { color: 'rgba(0, 0, 0, 0.3)', fontStyle: 'italic' },
          string: 'rgb(203, 75, 22)',
          number: 'rgb(38, 139, 210)',
          boolean: 'green',
          null: { color: 'rgb(220, 50, 47)', fontVariant: 'small-caps', fontWeight: 'bold' },
          input: ['#292929', { fontSize: '90%' }],
          inputHighlight: '#b3d8ff',
          error: { fontSize: '0.8em', color: 'red', fontWeight: 'bold' },
          iconCollection: 'rgb(0, 43, 54)',
          iconEdit: 'edit',
          iconDelete: 'rgb(203, 75, 22)',
          iconAdd: 'edit',
          iconCopy: 'rgb(38, 139, 210)',
          iconOk: 'green',
          iconCancel: 'rgb(203, 75, 22)',
        },
      }}
    />
  )
}

export const JsonEditor = genericMemo(_JsonEditor)
