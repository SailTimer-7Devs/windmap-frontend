export const WIND_FILES = {
  WINDMAP: 'wind_data.png',
  HEATMAP: 'wind_data_heatmap.png',
  DIRECTION_HEATMAP: 'wind_data_direction_heatmap.png'
}

export const WNI_PSWH_FILES = {
  HEATMAP: 'wni_pswh_heatmap_feet.png',
  PSWH_UV: 'wni_pswh_uv_feet.png'
}

export const WNI_PWH_FILES = {
  WAVE_HEATMAP: 'wni_pwh_heatmap_feet.png',
  WAVE_UV: 'wni_pwh_uv_feet.png'
}

export const WNI_WSH_FILES = {
  HEATMAP: 'wni_wsh_heatmap_feet.png',
  UV: 'wni_wsh_uv_feet.png'
}

export const WEATHER_WNI_FILES = {
  ICE: 'wni_ice_pack_heatmap.png',
  INTPCP: 'wni_v2_intpcp_heatmap.png',
  AIR_TEMPERATURE: 'wni_v2_tmp1000hpa_heatmap.png',
  TMP850HPA: 'wni_v2_tmp850hpa_heatmap.png',
  VISIBILITY: 'wni_v2_vis_heatmap.png',
  WIND_UV: 'wni_wind_uv_mps.png',
  WIND_HEATMAP: 'wni_wind_heatmap_mps.png',
  SST: 'wni_sst_heatmap.png',
  OCEAN_CURRENT_UV: 'wni_current_uv_mps.png',
  OCEAN_CURRENT_HEATMAP: 'wni_current_heatmap_mps.png',
  ...WNI_PWH_FILES,
  ...WNI_PSWH_FILES
}
