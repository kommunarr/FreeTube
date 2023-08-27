import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import FtSettingsSection from '../ft-settings-section/ft-settings-section.vue'
import FtSelect from '../ft-select/ft-select.vue'
import FtToggleSwitch from '../ft-toggle-switch/ft-toggle-switch.vue'
import FtSlider from '../ft-slider/ft-slider.vue'
import FtFlexBox from '../ft-flex-box/ft-flex-box.vue'
import FtPrompt from '../ft-prompt/ft-prompt.vue'
import { colors, calculateColorContrastRatio } from '../../helpers/colors'

export default defineComponent({
  name: 'ThemeSettings',
  components: {
    'ft-settings-section': FtSettingsSection,
    'ft-select': FtSelect,
    'ft-toggle-switch': FtToggleSwitch,
    'ft-slider': FtSlider,
    'ft-flex-box': FtFlexBox,
    'ft-prompt': FtPrompt
  },
  data: function () {
    return {
      minUiScale: 50,
      maxUiScale: 300,
      uiScaleStep: 5,
      disableSmoothScrollingToggleValue: false,
      showRestartPrompt: false,
      colorValues: function () {
        const cardColor = getComputedStyle(document.querySelector('.ft-card')).getPropertyValue('--card-bg-color').trim()

        // while the AA standard is 4.5, this contrast checker seems to consistently give results that are 1.3 points below most other contrast checkers
        const accessibleColors = colors.filter(color => (1.3 + calculateColorContrastRatio(cardColor, color.value)) >= 4.5)
        return accessibleColors.map(color => color.name)
      },

      colorNames: function () {
        return this.colorValues().map(colorVal => {
          // add spaces before capital letters
          const colorName = colorVal.replaceAll(/([A-Z])/g, ' $1').trim()
          return this.$t(`Settings.Theme Settings.Main Color Theme.${colorName}`)
        })
      },
      restartPromptValues: [
        'yes',
        'no'
      ],
      baseThemeValues: [
        'system',
        'light',
        'dark',
        'black',
        'dracula',
        'catppuccinMocha'
      ]
    }
  },
  computed: {
    barColor: function () {
      return this.$store.getters.getBarColor
    },

    baseTheme: function () {
      return this.$store.getters.getBaseTheme
    },

    mainColor: function () {
      return this.$store.getters.getMainColor
    },

    secColor: function () {
      return this.$store.getters.getSecColor
    },

    accessibilityOverrideMainColor: function () {
      return this.$store.getters.getAccessibilityOverrideMainColor
    },

    accessibilityOverrideSecColor: function () {
      return this.$store.getters.getAccessibilityOverrideSecColor
    },

    isSideNavOpen: function () {
      return this.$store.getters.getIsSideNavOpen
    },

    uiScale: function () {
      return this.$store.getters.getUiScale
    },

    disableSmoothScrolling: function () {
      return this.$store.getters.getDisableSmoothScrolling
    },

    expandSideBar: function () {
      return this.$store.getters.getExpandSideBar
    },

    hideLabelsSideBar: function () {
      return this.$store.getters.getHideLabelsSideBar
    },

    hideHeaderLogo: function () {
      return this.$store.getters.getHideHeaderLogo
    },

    restartPromptMessage: function () {
      return this.$t('Settings["The app needs to restart for changes to take effect. Restart and apply change?"]')
    },

    restartPromptNames: function () {
      return [
        this.$t('Yes'),
        this.$t('No')
      ]
    },

    baseThemeNames: function () {
      return [
        this.$t('Settings.Theme Settings.Base Theme.System Default'),
        this.$t('Settings.Theme Settings.Base Theme.Light'),
        this.$t('Settings.Theme Settings.Base Theme.Dark'),
        this.$t('Settings.Theme Settings.Base Theme.Black'),
        this.$t('Settings.Theme Settings.Base Theme.Dracula'),
        this.$t('Settings.Theme Settings.Base Theme.Catppuccin Mocha')
      ]
    },

    usingElectron: function () {
      return process.env.IS_ELECTRON
    }
  },
  mounted: function () {
    this.disableSmoothScrollingToggleValue = this.disableSmoothScrolling
  },
  methods: {
    handleExpandSideBar: function (value) {
      if (this.isSideNavOpen !== value) {
        this.$store.commit('toggleSideNav')
      }

      this.updateExpandSideBar(value)
    },

    handleRestartPrompt: function (value) {
      this.disableSmoothScrollingToggleValue = value
      this.showRestartPrompt = true
    },

    handleSmoothScrolling: function (value) {
      this.showRestartPrompt = false

      if (value === null || value === 'no') {
        this.disableSmoothScrollingToggleValue = !this.disableSmoothScrollingToggleValue
        return
      }

      this.updateDisableSmoothScrolling(
        this.disableSmoothScrollingToggleValue
      ).then(() => {
        const { ipcRenderer } = require('electron')
        ipcRenderer.send('relaunchRequest')
      })
    },

    handleBaseThemeChange: function (value) {
      this.updateBaseTheme(value).then(() => {
        const colorValues = this.colorValues()
        const accessibilityOverrideMainColor = !colorValues.includes(this.mainColor) ? colorValues[0] : ''
        const accessibilityOverrideSecColor = !colorValues.includes(this.secColor) ? colorValues[1] : ''

        this.updateAccessibilityOverrideMainColor(accessibilityOverrideMainColor)
        this.updateAccessibilityOverrideSecColor(accessibilityOverrideSecColor)
      })
    },

    ...mapActions([
      'updateBarColor',
      'updateBaseTheme',
      'updateMainColor',
      'updateSecColor',
      'updateAccessibilityOverrideMainColor',
      'updateAccessibilityOverrideSecColor',
      'updateExpandSideBar',
      'updateUiScale',
      'updateDisableSmoothScrolling',
      'updateHideLabelsSideBar',
      'updateHideHeaderLogo'
    ])
  }
})
