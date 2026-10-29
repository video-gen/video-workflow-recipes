import React from 'react';
import {AbsoluteFill,OffthreadVideo,Sequence,staticFile,useCurrentFrame,interpolate} from 'remotion';
import {OfferLowerThird} from './OfferLowerThird';
export const ProductAd:React.FC<{mediaFile:string|null}> = ({mediaFile}) => {
 const frame=useCurrentFrame();
 const scale=interpolate(frame,[0,180],[0.95,1.04]);
 return <AbsoluteFill style={{backgroundColor:'#e8eee9',fontFamily:'Arial, sans-serif',color:'#142c38'}}>
 {mediaFile == null ? <AbsoluteFill style={{alignItems:'center',justifyContent:'center',transform:`scale(${scale})`}}>
  <div style={{width:200,height:60,backgroundColor:'#263e45',borderRadius:'24px 24px 0 0'}} />
  <div style={{width:320,height:650,backgroundColor:'#43816b',borderRadius:70,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{fontSize:42,color:'white',fontWeight:700,transform:'rotate(-90deg)'}}>EVERYDAY</div></div>
 </AbsoluteFill> : <OffthreadVideo src={staticFile(mediaFile)} style={{width:'100%',height:'100%',objectFit:'cover'}} />}
 <div style={{position:'absolute',top:140,left:80,right:80,fontSize:76,fontWeight:700}}>Bring less. Do more.</div>
 <div style={{position:'absolute',left:80,top:340,fontSize:28}}>Made for your daily routine.</div>
 <Sequence from={30} durationInFrames={150}><div style={{position:'absolute',left:80,bottom:180,transform:'scale(1.18)',transformOrigin:'bottom left'}}><OfferLowerThird /></div></Sequence>
 <div style={{position:'absolute',bottom:90,left:80,fontSize:22}}>DEMO PRODUCT · SAMPLE CREATIVE</div>
 </AbsoluteFill>;
};
