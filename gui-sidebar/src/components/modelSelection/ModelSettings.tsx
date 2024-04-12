import { useState, useMemo } from 'react'
// import { useFormContext } from 'react-hook-form'
import styled from 'styled-components'
import { Input, Label, Select, TextArea, defaultBorderRadius, lightGray } from '..'
import { getFontSize } from '../../util'

import { ModelDescription } from '../../core'

const Div = styled.div`
  border: 1px solid ${lightGray};
  border-radius: ${defaultBorderRadius};
  padding: 8px;
  margin-bottom: 16px;
`

const providers = {
  openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-vision-preview'],
  alibaba: ['qwen-turbo', 'qwen-max', 'qwen-max-longcontext', 'qwen-vl-plus', 'qwen-vl-max'],
  baidu: ['ernie-3.5', 'ernie-4']
}

function ModelSettings(props: { model: ModelDescription }) {
  const [model] = useState(props.model)
  // const { register, setValue, getValues } = useFormContext()

  const supportedModels = useMemo(() => {
    return providers[model.provider] || []
  }, [model])

  return (
    <Div>
      <form>
        <Label fontSize={getFontSize()}>API Key</Label>
        <Input
          type="text"
          defaultValue={model.apiKey}
          placeholder="API Key"
          // {...register(`apiKey`)}
        />

        <Label fontSize={getFontSize()}>Model</Label>
        <div>
          <Select defaultValue={model.model}>
            <option disabled value="">
              Select Model
            </option>
            {supportedModels.map((model) => {
              return <option value={model}>{model}</option>
            })}
          </Select>
        </div>

        <Label fontSize={getFontSize()}>System Message</Label>
        <TextArea
          placeholder="Enter a system message (e.g. 'Always respond in German')"
          defaultValue={model.systemMessage}
        />
      </form>
    </Div>
  )
}

export default ModelSettings
