import config from "@/config/addresses";
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      NETWORKS: {
        1: "https://etherscan.io",
        11155111: "https://sepolia.etherscan.io",
        137: "https://polygonscan.com",
        80001: "https://mumbai.polygonscan.com",
      },
      GTX_ADDRESS: config.GTX_ADDRESS,
      TOKEN_ADDRESS: config.TOKEN_ADDRESS,
      LOCKER_ADDRESS: config.LOCKER_ADDRESS,
      TOKEN_POLYGON_ADDRESS: config.TOKEN_POLYGON_ADDRESS,
      ...mapActions("wallet", [
        "SET_WEB3",
        "SET_CHAIN_ID",
        "SET_USER_ADDRESS",
        "SET_GTX_INSTANCE",
        "SET_TOKEN_INSTANCE",
        "SET_LOCKER_INSTANCE",
      ]),
    };
  },
  methods: {
    addrTruncation(addr) {
      return (
        addr.slice(0, 6) + ". . . . . ." + addr.slice(addr.length - 6, addr.length)
      );
    },

    humanized(number, fix) {
      return Number(
        this.getWeb3.utils.fromWei(number.toString(), "ether")
      ).toFixed(number == 0 ? 2 : fix);
    },

    isNumber: function (evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        evt.preventDefault();
      } else {
        return true;
      }
    },

    timeConverter(UNIX_timestamp) {
      if (Number(UNIX_timestamp)) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
      } else return 'No lock time'
    },

    calculateEpochTimestamp(duration) {
      const now = Math.floor(Date.now() / 1000); // Current epoch timestamp in seconds
      const secondsInMinute = 60;
      const secondsInHour = 60 * secondsInMinute;
      const secondsInDay = 24 * secondsInHour;
      const secondsInWeek = 7 * secondsInDay;
      const secondsInMonth = 30 * secondsInDay;
      const secondsInYear = 365 * secondsInDay;

      let durationInSeconds;

      if (duration.endsWith('Week')) {
        const weeks = parseInt(duration);
        durationInSeconds = weeks * secondsInWeek;
      } else if (duration.endsWith('Month')) {
        const months = parseInt(duration);
        durationInSeconds = months * secondsInMonth;
      } else if (duration.endsWith('Months')) {
        const months = parseInt(duration);
        durationInSeconds = months * secondsInMonth;
      } else if (duration.endsWith('Year')) {
        const years = parseInt(duration);
        durationInSeconds = years * secondsInYear;
      } else {
        return ""
      }

      return now + durationInSeconds;
    }
  },
  computed: {
    ...mapGetters("wallet", [
      "getWeb3",
      "CHAIN_ID",
      "getUserAddress",
      "getGTXInstance",
      "getTOKENInstance",
      "getLOCKERInstance",
    ]),
    isEthereum() {
      if (this.getUserAddress) {
        if (this.CHAIN_ID === 1 || this.CHAIN_ID === 11155111)
          return true
        else return false
      } else {
        return false
      }
    },
  },

};
