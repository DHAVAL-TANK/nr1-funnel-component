# nr1-funnel-component

NR1 component for displaying one or many NRQL funnel queries in a single visualization.

## Usage

We have two portions implement this component: a JS and CSS import.

### Installation

Run the following command from within your project.

```
npm install --save https://github.com/newrelic/nr1-funnel-component.git
```

### CSS
Import the component's CSS into your Nerdlet/artifact's styles.scss or styles.css with the following.

```
@import '~@nr1-funnel-component/dist/commonjs/styles.css';
```

### JS
Import the component's into your Nerdlet with the following.

```
import { FunnelComponent } from 'nr1-funnel-component';
```

You can see (or will eventually see) an example of usage in the [Customer Journey project](https://github.com/newrelic/nr1-customer-journey). For now, checkout the storybook.

```
git clone https://github.com/newrelic/nr1-funnel-component.git
cd nr1-funnel-component
npm install
```
