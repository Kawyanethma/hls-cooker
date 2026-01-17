import { Text } from '@radix-ui/themes'
import ChefHatIcon from '@renderer/assets/chef-hat'
import { JSX } from 'react'

export default function Logo(): JSX.Element {
  return (
    <div>
      <div className="flex items-center justify-center gap-2">
        <ChefHatIcon size={40} color="#e3e3e3" />
        <h1 className="text-3xl pt-3">
          HLS <span className="text-[#FF5733]">Cooker</span>
        </h1>
      </div>
      <Text size="2" color="gray">
        Batch process your media files
      </Text>
    </div>
  )
}
