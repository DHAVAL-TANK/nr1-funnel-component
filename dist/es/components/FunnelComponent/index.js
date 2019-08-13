"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _taggedTemplateLiteral2 = require("babel-runtime/helpers/taggedTemplateLiteral");

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(["\n            ", "\n          "], ["\n            ", "\n          "]);
//import testdata from "./testdata";


var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _funnelGraphJs = require("funnel-graph-js");

var _funnelGraphJs2 = _interopRequireDefault(_funnelGraphJs);

var _lodash = require("lodash");

var _graphqlTag = require("graphql-tag");

var _graphqlTag2 = _interopRequireDefault(_graphqlTag);

var _niceColorPalettes = require("nice-color-palettes");

var _niceColorPalettes2 = _interopRequireDefault(_niceColorPalettes);

var _nerdGraphApolloClient = require("@datanerd/nerd-graph-apollo-client");

var _nerdGraphApolloClient2 = _interopRequireDefault(_nerdGraphApolloClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get_color_set() {
  var num = Math.floor(Math.random() * 100);
  num = num >= 0 ? num : 0;
  return [_niceColorPalettes2.default[num][2]];
}

var client = new _nerdGraphApolloClient2.default({
  uri: window && window.__nr ? window.__nr.services["nerdgraph"] : "https://nerd-graph.staging-service.newrelic.com/graphql"
});

var FunnelComponent = function (_React$Component) {
  (0, _inherits3.default)(FunnelComponent, _React$Component);

  function FunnelComponent(props) {
    (0, _classCallCheck3.default)(this, FunnelComponent);
    return (0, _possibleConstructorReturn3.default)(this, (FunnelComponent.__proto__ || (0, _getPrototypeOf2.default)(FunnelComponent)).call(this, props));
  }

  (0, _createClass3.default)(FunnelComponent, [{
    key: "_buildGql",
    value: function _buildGql() {
      var _this2 = this;

      var _props = this.props,
          accountId = _props.accountId,
          series = _props.series;

      return "{\n      actor {\n        account(id: " + accountId + ") {\n          " + series.map(function (s) {
        return (0, _lodash.camelCase)(s.label) + ":nrql(query: \"" + _this2._constructFunnelNrql(s) + "\") {\n              results\n            }";
      }) + "\n        }\n      }\n    }";
    }
  }, {
    key: "_constructFunnelNrql",
    value: function _constructFunnelNrql(series) {
      var _props2 = this.props,
          measure = _props2.measure,
          steps = _props2.steps,
          nr1 = _props2.nr1;

      var since = nr1 && nr1.launcher.state.timeRange ? "SINCE " + nr1.launcher.state.timeRange.duration / 1000 / 60 + " MINUTES AGO" : "";
      return "FROM " + measure.eventName + " SELECT funnel(" + measure.name + " " + steps.map(function (step) {
        return ", WHERE " + step.nrql + " as '" + step.label + "'";
      }).join(" ") + ") WHERE " + series.nrql + " " + since;
    }
  }, {
    key: "_getData",
    value: function _getData() {
      var _this3 = this;

      return new _promise2.default(function (resolve) {
        var query = _this3._buildGql();
        //console.log("query", query); //eslint-disable-line
        client.query({
          query: (0, _graphqlTag2.default)(_templateObject, query)
        }).then(function (results) {
          //console.log("results", results); //eslint-disable-line
          var _props3 = _this3.props,
              series = _props3.series,
              steps = _props3.steps;

          var data = {
            subLabels: series.map(function (s) {
              return s.label;
            }),
            labels: steps.map(function (step) {
              return step.label;
            }),
            colors: series.map(function (s) {
              return get_color_set();
            }), //eslint-disable-line
            values: []
          };
          series.forEach(function (s) {
            var _steps = (0, _lodash.get)(results, "data.actor.account." + (0, _lodash.camelCase)(s.label) + ".results[0].steps");
            if (data.values.length == 0) {
              _steps.forEach(function (step) {
                data.values.push([step]);
              });
            } else {
              _steps.forEach(function (step, i) {
                data.values[i].push(step);
              });
            }
          });
          //console.log("data", data); //eslint-disable-line
          resolve(data);
        }).catch(function (error) {
          console.error(error); //eslint-disable-line
        });
      });
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      var _this4 = this;

      var next = (0, _stringify2.default)({
        steps: nextProps.steps,
        measure: nextProps.measure,
        series: nextProps.series
      });
      var current = (0, _stringify2.default)({
        steps: this.props.steps,
        measure: this.props.measure,
        series: this.props.series
      });
      var nextRange = nextProps.nr1 ? nextProps.nr1.launcher.state.timeRange.duration : null;
      var currentRange = this.props.nr1 ? this.props.nr1.launcher.state.timeRange.duration : null;
      if (next !== current || nextRange != currentRange) {
        this._getData().then(function (data) {
          _this4.graph.updateData(data);
        });
      }
      return true;
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this5 = this;

      this._getData().then(function (data) {
        _this5.graph = new _funnelGraphJs2.default({
          container: ".funnel",
          gradientDirection: "vertical",
          data: data,
          displayPercent: true,
          direction: "vertical",
          width: 400,
          height: 700,
          subLabelValue: "percent"
        });

        _this5.graph.draw();
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this6 = this;

      return _react2.default.createElement("div", { className: "funnel", ref: function ref(_ref) {
          return _this6._ref = _ref;
        } });
    }
  }]);
  return FunnelComponent;
}(_react2.default.Component);

FunnelComponent.propTypes = {
  accountId: _propTypes2.default.number.isRequired,
  nr1: _propTypes2.default.object,
  measure: _propTypes2.default.shape({
    eventName: _propTypes2.default.string.isRequired,
    label: _propTypes2.default.string.isRequired,
    name: _propTypes2.default.string.isRequired //what are we funneling?
  }).isRequired,
  steps: _propTypes2.default.arrayOf(_propTypes2.default.shape({
    label: _propTypes2.default.string.isRequired,
    nrql: _propTypes2.default.string.isRequired //fragment of NRQL used ot construct the series of funnel queries
  })),
  series: _propTypes2.default.arrayOf(_propTypes2.default.shape({
    label: _propTypes2.default.string.isRequired,
    nrql: _propTypes2.default.string.isRequired //fragment of NRQL used ot construct the series of funnel queries
  }))
};
exports.default = FunnelComponent;