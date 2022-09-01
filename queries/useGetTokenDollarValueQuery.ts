/*
 * takes base token price, fetches the ratio of the token provided vs the base token
 * and calculates the dollar value of the provided token
 * */
import { useCosmWasmClient } from '../hooks/useCosmWasmClient'
import { useTokenDollarValue } from '../hooks/useTokenDollarValue'
import { useBaseTokenInfo } from '../hooks/useTokenInfo'
import { tokenToTokenPriceQueryWithPools, tokenToTokenPriceQuery } from './tokenToTokenPriceQuery'
import { useGetQueryMatchingPoolForSwap } from './useQueryMatchingPoolForSwap'
import { useRecoilValue } from 'recoil'
import { walletState } from '../state/atoms/walletAtoms'
import { useTokenInfo } from '../hooks/useTokenInfo'

export const useGetTokenDollarValueQuery = () => {
  const tokenA = useBaseTokenInfo()
  // const client = useCosmWasmClient()
  const { client } = useRecoilValue(walletState)
  const [tokenADollarPrice, fetchingDollarPrice] = useTokenDollarValue(
    tokenA?.symbol
  )


  const [getMatchingPoolForSwap, isLoadingPoolForSwapMatcher] =
    useGetQueryMatchingPoolForSwap()

  return [
    async function getTokenDollarValue({ tokenInfo, tokenAmountInDenom }) {
      if (!tokenAmountInDenom) return 0

      const priceForOneToken = await tokenToTokenPriceQueryWithPools({
        matchingPools: getMatchingPoolForSwap({ tokenA, tokenB: tokenInfo }),
        tokenA,
        tokenB: tokenInfo,
        client,
        amount: 1,
        id: tokenInfo?.id
      })

      if (tokenA?.id === tokenInfo?.id)
        return (tokenAmountInDenom / priceForOneToken) * tokenADollarPrice
      else return priceForOneToken
      
    },
    Boolean(
      tokenA && client && !fetchingDollarPrice && !isLoadingPoolForSwapMatcher
    ),
  ] as const
}
