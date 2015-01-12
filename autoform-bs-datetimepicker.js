/*
Prerequisites
-------------
$ meteor add comerc:bs-datetimepicker

Usage
-----
```coffee
  autoform:
    afFieldInput:
      type: "bootstrap-datetimepicker"
      buttonClasses: null # 'glyphicon glyphicon-calendar', 'fa fa-calendar'
      outMode: null # 'utcDate', 'utcDateTime'
      timezoneId: null # http://momentjs.com/timezone/
      dateTimePickerOptions: {}
```
*/
AutoForm.addInputType('bootstrap-datetimepicker', {
  template: 'afBootstrapDateTimePicker',
  valueIn: function (val, atts) {
    // datetimepicker expects the date to represent local time,
    // so we need to adjust it if there's a timezoneId specified
    var timezoneId = atts.timezoneId;
    if (typeof timezoneId === 'string') {
      if (typeof moment.tz !== 'function') {
        throw new Error("If you specify a timezoneId, make sure that you've added a moment-timezone package to your app");
      }
      if (val instanceof Date) {
        return moment(AutoForm.Utility.dateToNormalizedLocalDateAndTimeString(val, timezoneId), "YYYY-MM-DD[T]HH:mm:ss.SSS").toDate();
      }
    }
    var outMode = atts.outMode;
    if (outMode === 'utcDate')
      return utcDateToLocal(val);
    else if (outMode === 'utcDateTime')
      return utcDateTimeToLocal(val);
    else
      return val;
  },
  valueOut: function () {
    var $input = this.data('has-button') ? this.parent() : this;
    var dtp = $input.data('DateTimePicker');
    var m = dtp.date();
    if (!m) {
      return m;
    }
    var timezoneId = this.data('timezone-id');
    // default is local, but if there's a timezoneId, we use that
    if (typeof timezoneId === 'string') {
      if (typeof moment.tz !== 'function') {
        throw new Error("If you specify a timezoneId, make sure that you've added a moment-timezone package to your app");
      }
      m = moment.tz(AutoForm.Utility.dateToNormalizedLocalDateAndTimeString(m.toDate()), timezoneId);
    }
    var outMode = this.data('out-mode');
    if (outMode === 'utcDate')
      return moment.utc([m.year(), m.month(), m.date(), 0, 0, 0, 0]).toDate();
    else if (outMode === 'utcDateTime')
      return moment.utc([m.year(), m.month(), m.date(), m.hour(), m.minute(), 0, 0]).toDate();
    else
      return m.toDate();
  },
  valueConverters: {
    'string': function (val) {
      return (val instanceof Date) ? val.toString() : val;
    },
    'stringArray': function (val) {
      if (val instanceof Date) {
        return [val.toString()];
      }
      return val;
    },
    'number': function (val) {
      return (val instanceof Date) ? val.getTime() : val;
    },
    'numberArray': function (val) {
      if (val instanceof Date) {
        return [val.getTime()];
      }
      return val;
    },
    'dateArray': function (val) {
      if (val instanceof Date) {
        return [val];
      }
      return val;
    }
  },
  contextAdjust: function (context) {
    if (context.atts.buttonClasses) {
      context.atts['data-has-button'] = true;
    }
    if (context.atts.timezoneId) {
      context.atts['data-timezone-id'] = context.atts.timezoneId;
    }
    delete context.atts.timezoneId;
    if (context.atts.outMode) {
      context.atts['data-out-mode'] = context.atts.outMode;
    }
    delete context.atts.outMode;
    return context;
  }
});

Template.afBootstrapDateTimePicker.helpers({
  atts: function addFormControlAtts() {
    var atts = _.clone(this.atts);
    // Add bootstrap class
    atts = AutoForm.Utility.addClass(atts, 'form-control');
    delete atts.dateTimePickerOptions;
    return atts;
  }
});

Template.afBootstrapDateTimePicker.rendered = function () {
  var $input = this.data.atts.buttonClasses ? this.$('input').parent() : this.$('input');
  var data = this.data;
  var opts = data.atts.dateTimePickerOptions || {};

  // instanciate datetimepicker
  $input.datetimepicker(opts);

  // set and reactively update values
  this.autorun(function () {
    var data = Template.currentData();
    var dtp = $input.data('DateTimePicker');

    // set field value
    if (data.value) {
      dtp.date(data.value);
    } else {
      dtp.date(null); // clear
    }

    // set start date if there's a min in the schema
    if (data.min) {
      dtp.minDate(data.min);
    } else {
      dtp.minDate(false);
    }

    // set end date if there's a max in the schema
    if (data.max) {
      dtp.maxDate(data.max);
    } else {
      dtp.maxDate(false);
    }
  });

};

Template.afBootstrapDateTimePicker.destroyed = function () {
  var $input = this.data.atts.buttonClasses ? this.$('input').parent() : this.$('input');
  var dtp = $input.data('DateTimePicker');
  if (dtp) {
    dtp.destroy();
  }
};

function utcDateTimeToLocal(utcDateTime) {
  var local = new Date();
  local.setDate(utcDateTime.getUTCDate());
  local.setMonth(utcDateTime.getUTCMonth());
  local.setFullYear(utcDateTime.getUTCFullYear());
  local.setHours(utcDateTime.getUTCHours());
  local.setMinutes(utcDateTime.getUTCMinutes());
  local.setSeconds(0);
  local.setMilliseconds(0);
  return local;
}

function utcDateToLocal(utcDate) {
  var local = new Date();
  local.setDate(utcDateTime.getUTCDate());
  local.setMonth(utcDateTime.getUTCMonth());
  local.setFullYear(utcDateTime.getUTCFullYear());
  local.setHours(0);
  local.setMinutes(0);
  local.setSeconds(0);
  local.setMilliseconds(0);
  return local;
}
