import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ContinueConfig } from '../core'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import {
  Button,
  Hr,
  NumberInput,
  TextArea,
  lightGray,
  vscBackground,
  // vscForeground,
  vscInputBackground,
  Select
} from '../components'
import InfoHover from '../components/InfoHover'
import Loader from '../components/loaders/Loader'
import ModelSettings from '../components/modelSelection/ModelSettings'
import { RootState } from '../redux/store'
import { getFontSize } from '../util'

const CancelButton = styled(Button)`
  background-color: transparent;
  color: ${lightGray};
  border: 1px solid ${lightGray};
  &:hover {
    background-color: ${lightGray};
    color: black;
  }
`

const SaveButton = styled(Button)`
  &:hover {
    opacity: 0.8;
  }
`

const Slider = styled.input.attrs({ type: 'range' })`
  --webkit-appearance: none;
  width: 100%;
  background-color: ${vscInputBackground};
  outline: none;
  border: none;
  opacity: 0.7;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    cursor: pointer;
    background: ${lightGray};
    border-radius: 4px;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 8px;
    height: 8px;
    cursor: pointer;
    margin-top: -3px;
  }
  &::-moz-range-thumb {
    width: 8px;
    height: 8px;
    cursor: pointer;
    margin-top: -3px;
  }

  &:focus {
    outline: none;
    border: none;
  }
`

function Settings() {
  const formMethods = useForm<ContinueConfig>()
  const onSubmit = (data: ContinueConfig) => {
    console.log(data)
  }

  const navigate = useNavigate()
  const config = useSelector((state: RootState) => state.state.config)

  const submitChanges = () => {
    // pass
  }

  const submitAndLeave = () => {
    submitChanges()
    navigate('/')
  }

  useEffect(() => {
    if (!config) return

    formMethods.setValue('systemMessage', config.systemMessage)
    formMethods.setValue('completionOptions.temperature', config.completionOptions?.temperature)
  }, [config])

  return (
    <FormProvider {...formMethods}>
      <div className="overflow-y-scroll">
        <div
          className="items-center flex sticky top-0"
          style={{
            borderBottom: `0.5px solid ${lightGray}`,
            backgroundColor: vscBackground
          }}
        >
          <ArrowLeftIcon
            width="1.2em"
            height="1.2em"
            onClick={submitAndLeave}
            className="inline-block ml-4 cursor-pointer"
          />
          <h3 className="text-lg font-bold m-2 inline-block">Settings</h3>
        </div>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          {config ? (
            <div className="p-2">
              <h3 className="flex gap-1">
                System Message
                <InfoHover
                  msg={`Set a system message with information that the LLM should always
              keep in mind (e.g. "Please give concise answers. Always respond in
              Spanish.")`}
                />
              </h3>
              <TextArea
                placeholder="Enter a system message (e.g. 'Always respond in German')"
                {...formMethods.register('systemMessage')}
              />

              <Hr />
              <h3 className="flex gap-1">
                Temperature
                <InfoHover
                  msg={`Set temperature to any value between 0 and 1. Higher values will
            make the LLM more creative, while lower values will make it more
            predictable.`}
                />
              </h3>
              <div className="flex justify-between mx-16 gap-1">
                <p>0</p>
                <Slider
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  {...formMethods.register('completionOptions.temperature')}
                />
                <p>1</p>
              </div>
              <div className="text-center" style={{ marginTop: '-25px' }}>
                <p className="text-sm text-gray-500">
                  {(formMethods.watch('completionOptions.temperature') as number | undefined) ||
                    config.completionOptions?.temperature ||
                    '-'}
                </p>
              </div>
              <Hr />

              <h3 className="flex gap-1">Models</h3>
              {config.models.map((model) => {
                return (
                  <>
                    <h4>{model.title}</h4>
                    <ModelSettings model={model} />
                  </>
                )
              })}
            </div>
          ) : (
            <Loader />
          )}
        </form>

        <hr />

        <div className="px-2">
          <h3>Appearance</h3>

          <p>Font Size</p>
          <NumberInput
            type="number"
            min="8"
            max="48"
            step="1"
            defaultValue={getFontSize()}
            onChange={(e) => {
              localStorage.setItem('fontSize', e.target.value)
            }}
          />

          <p>Theme</p>
          <div className="my-4">
            <Select defaultValue="dark">
              <option disabled value="">
                Select Theme
              </option>
              <option value="auto">Auto</option>
              <option value="dark">Dark</option>
              <option value="highlight">Highlight</option>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 justify-end px-4">
          <CancelButton
            onClick={() => {
              navigate('/')
            }}
          >
            Cancel
          </CancelButton>
          <SaveButton onClick={submitAndLeave}>Save</SaveButton>
        </div>
      </div>
    </FormProvider>
  )
}

export default Settings
