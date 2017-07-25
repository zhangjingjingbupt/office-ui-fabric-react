import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import {
  ExampleCard,
  IComponentDemoPageProps,
  ComponentPage,
  PropertiesTableSet
} from '@uifabric/example-app-base';
import { TilesListBasicExample } from './examples/TilesList.Basic.Example';
const TilesListBasicExampleCode = require('!raw-loader!office-ui-fabric-react/src/components/TilesList/examples/TilesList.Basic.Example.tsx') as string;

export class TilesListPage extends React.Component<IComponentDemoPageProps, {}> {
  public render() {
    return (
      <ComponentPage
        title='TilesList'
        componentName='TilesListExample'
        exampleCards={
          <div>
            <ExampleCard title='TilesList with randomly-generated groups using different grid styles and item aspect ratios' isOptIn={ true } code={ TilesListBasicExampleCode }>
              <TilesListBasicExample />
            </ExampleCard>
          </div>
        }
        propertiesTables={
          <PropertiesTableSet
            sources={ [
              require<string>('!raw-loader!office-ui-fabric-react/src/components/TilesList/TilesList.Props.ts')
            ] }
          />
        }
        overview={
          <div>
            <p>
              <code>TilesList</code> is a specialization of the <Link href='#/examples/List'><code>List</code></Link> component.
              It is intended to represent items visual using a one or mote content-focused flowing grids.
            </p>
            <p>
              <code>TilesList</code> is designed to be used in conjunction with the <code>Tile</code> component. The <code>Tile</code> component provides a standardized form of focusable and selectable content item.
            </p>
          </div>
        }
        bestPractices={
          <div></div>
        }
        dos={
          <div>
            <ul>
              <li>Use them to represent a large collection of items visually.</li>
            </ul>
          </div>
        }
        donts={
          <div>
            <ul>
              <li>Use them for general layout of components that are not part of the same set.</li>
            </ul>
          </div>
        }
        isHeaderVisible={ this.props.isHeaderVisible }>
      </ComponentPage>
    );
  }
}
