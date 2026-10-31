/**
 * 解題時間の典型カーブ（irt5_time の時間項で使用）。
 *
 * 全705コンテスト（ABC abc001–476 ※abc316を除く、ARC arc001–230）の順位表から、
 * Competitions >= 5 かつ OldRating > 0 のユーザーのAC観測 8,750,621 件で学習した。
 * x = (D - A) / 400（A = OldRating）で 0.25 刻みに区切り、各区間について
 * 増分時間（分）の対数の中央値 m と、MAD から求めた Laplace スケール s を記録している。
 * m には単調性（isotonic 回帰）を適用済み。s は [0.2, 2.0] にクランプ済み。
 * 観測が50件未満の区間は含めていない。
 */
export interface TimeCurveBin {
  /** 区間の中心 x = (D - A) / 400 */
  center: number;
  /** log(増分時間[分]) の中央値 */
  medianLogTime: number;
  /** Laplace 分布のスケール */
  scale: number;
}

export const TIME_CURVE_BINS: readonly TimeCurveBin[] = [
  { center: -7.875, medianLogTime: 0.19611487892629034, scale: 0.6303544035351706 },
  { center: -7.625, medianLogTime: 0.28768207245178085, scale: 0.5940076403241631 },
  { center: -7.375, medianLogTime: 0.3244960455744972, scale: 0.5676845092893206 },
  { center: -7.125, medianLogTime: 0.371563556432483, scale: 0.560300446486887 },
  { center: -6.875, medianLogTime: 0.4165149442947493, scale: 0.5582945502590764 },
  { center: -6.625, medianLogTime: 0.4595323293784401, scale: 0.5490854643925597 },
  { center: -6.375, medianLogTime: 0.5108256237659907, scale: 0.5563933485243854 },
  { center: -6.125, medianLogTime: 0.5690945318899664, scale: 0.5579954531208868 },
  { center: -5.875, medianLogTime: 0.6151856390902335, scale: 0.5655971758542252 },
  { center: -5.625, medianLogTime: 0.676340062243564, scale: 0.5788623011847384 },
  { center: -5.375, medianLogTime: 0.7419373447293773, scale: 0.5849625007211562 },
  { center: -5.125, medianLogTime: 0.8109302162163288, scale: 0.5885203201343452 },
  { center: -4.875, medianLogTime: 0.8823891801984736, scale: 0.5949465892937781 },
  { center: -4.625, medianLogTime: 0.9619012431262073, scale: 0.6081202217084086 },
  { center: -4.375, medianLogTime: 1.0473189942805592, scale: 0.6155704866515521 },
  { center: -4.125, medianLogTime: 1.1420974006078484, scale: 0.6352357072023799 },
  { center: -3.875, medianLogTime: 1.2335316065674804, scale: 0.6444163509313984 },
  { center: -3.625, medianLogTime: 1.3480731482996928, scale: 0.6718129146409553 },
  { center: -3.375, medianLogTime: 1.473999941538996, scale: 0.7025061234228333 },
  { center: -3.125, medianLogTime: 1.6160824551527688, scale: 0.7331388146256932 },
  { center: -2.875, medianLogTime: 1.766441661243765, scale: 0.7479680882236779 },
  { center: -2.625, medianLogTime: 1.9144686232204942, scale: 0.7559956480362855 },
  { center: -2.375, medianLogTime: 2.0412203288596382, scale: 0.7432245846378888 },
  { center: -2.125, medianLogTime: 2.1822989271195437, scale: 0.7423994802168343 },
  { center: -1.875, medianLogTime: 2.330524461683287, scale: 0.747681608537136 },
  { center: -1.625, medianLogTime: 2.473733349189875, scale: 0.7482682432317075 },
  { center: -1.375, medianLogTime: 2.6210388241125804, scale: 0.7516123701306079 },
  { center: -1.125, medianLogTime: 2.7652703414321014, scale: 0.7493260284987682 },
  { center: -0.875, medianLogTime: 2.915064370486536, scale: 0.7439330452738608 },
  { center: -0.625, medianLogTime: 3.0516399054922867, scale: 0.7349177655173478 },
  { center: -0.375, medianLogTime: 3.1745755659716206, scale: 0.7232274616771812 },
  { center: -0.125, medianLogTime: 3.2746258399726926, scale: 0.7058872829807621 },
  { center: 0.125, medianLogTime: 3.367870377546088, scale: 0.6822211603192595 },
  { center: 0.375, medianLogTime: 3.437743581319622, scale: 0.6585251328977977 },
  { center: 0.625, medianLogTime: 3.48788463205436, scale: 0.6418851941327868 },
  { center: 0.875, medianLogTime: 3.520953777603714, scale: 0.6301011795349043 },
  { center: 1.125, medianLogTime: 3.5414422991734833, scale: 0.6259428820203286 },
  { center: 1.375, medianLogTime: 3.547939706330979, scale: 0.6340643815746027 },
  { center: 1.625, medianLogTime: 3.565298392342582, scale: 0.6139183790174161 },
  { center: 1.875, medianLogTime: 3.5685932882394344, scale: 0.6144132678903204 },
  { center: 2.125, medianLogTime: 3.5821290841670557, scale: 0.604229725232607 },
  { center: 2.375, medianLogTime: 3.5821290841670557, scale: 0.6175303218959041 },
  { center: 2.625, medianLogTime: 3.5821290841670557, scale: 0.6149629115108384 },
  { center: 2.875, medianLogTime: 3.5821290841670557, scale: 0.6062460590891213 },
  { center: 3.125, medianLogTime: 3.5821290841670557, scale: 0.6039258668341476 },
  { center: 3.375, medianLogTime: 3.5821290841670557, scale: 0.6158216508569239 },
  { center: 3.625, medianLogTime: 3.5821290841670557, scale: 0.6133443020909782 },
  { center: 3.875, medianLogTime: 3.5821290841670557, scale: 0.615065852118524 },
  { center: 4.125, medianLogTime: 3.5821290841670557, scale: 0.6411481539972137 },
  { center: 4.375, medianLogTime: 3.5821290841670557, scale: 0.6279134596003206 },
  { center: 4.625, medianLogTime: 3.5821290841670557, scale: 0.6246517877190212 },
  { center: 4.875, medianLogTime: 3.5821290841670557, scale: 0.7454776785272372 },
  { center: 5.125, medianLogTime: 3.5821290841670557, scale: 0.630836023138593 },
  { center: 5.375, medianLogTime: 3.5821290841670557, scale: 0.6962458342549013 },
  { center: 5.625, medianLogTime: 3.5821290841670557, scale: 0.5793748174270709 },
  { center: 5.875, medianLogTime: 3.5821290841670557, scale: 0.6878446438598149 },
];
