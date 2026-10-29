import React from 'react';
import {registerRoot,Composition,AbsoluteFill} from 'remotion';
import {ProductAd} from './ProductAd';
import {OfferLowerThird} from './OfferLowerThird';
const OfferPreview:React.FC=()=> <AbsoluteFill style={{backgroundColor:'#e8eee9',alignItems:'center',justifyContent:'center'}}><OfferLowerThird /></AbsoluteFill>;
const Root:React.FC=()=> <>
 <Composition id="ProductAd" component={ProductAd} width={1080} height={1920} fps={30} durationInFrames={180} defaultProps={{mediaFile:null}} />
 <Composition id="OfferSingleFrame" component={OfferPreview} width={1080} height={360} fps={30} durationInFrames={1} />
 <Composition id="OfferPreview" component={OfferPreview} width={1080} height={360} fps={30} durationInFrames={120} />
</>;
registerRoot(Root);
