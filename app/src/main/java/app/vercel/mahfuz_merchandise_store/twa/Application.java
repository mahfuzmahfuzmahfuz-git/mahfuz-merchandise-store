/*
 * Copyright 2020 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package app.vercel.mahfuz_merchandise_store.twa;

import com.google.firebase.analytics.FirebaseAnalytics;

import java.util.EnumMap;
import java.util.Map;

public class Application extends android.app.Application {

  @Override
  public void onCreate() {
      super.onCreate();

      // Consent Mode v2, set before any other Firebase Analytics interaction so no
      // event (first_open, session_start, etc.) is ever collected under Firebase's
      // implicit default consent.
      //
      // Deliberate default: this app currently only serves synthetic/test traffic
      // (see scripts/synthetic-bot/ in the repo root), not real users, so consent is
      // granted outright here as an explicit, documented choice rather than left at
      // Firebase's implicit default. A production build serving real users would need
      // an in-app consent UI (the Android equivalent of src/components/ConsentBanner.jsx
      // on web) wired to DENIED by default, only calling setConsent(GRANTED) after the
      // user opts in -- matching the web banner's deny-by-default behavior.
      Map<FirebaseAnalytics.ConsentType, FirebaseAnalytics.ConsentStatus> consentSettings =
          new EnumMap<>(FirebaseAnalytics.ConsentType.class);
      consentSettings.put(FirebaseAnalytics.ConsentType.ANALYTICS_STORAGE, FirebaseAnalytics.ConsentStatus.GRANTED);
      consentSettings.put(FirebaseAnalytics.ConsentType.AD_STORAGE, FirebaseAnalytics.ConsentStatus.GRANTED);
      consentSettings.put(FirebaseAnalytics.ConsentType.AD_USER_DATA, FirebaseAnalytics.ConsentStatus.GRANTED);
      consentSettings.put(FirebaseAnalytics.ConsentType.AD_PERSONALIZATION, FirebaseAnalytics.ConsentStatus.GRANTED);
      FirebaseAnalytics.getInstance(this).setConsent(consentSettings);
  }
}
