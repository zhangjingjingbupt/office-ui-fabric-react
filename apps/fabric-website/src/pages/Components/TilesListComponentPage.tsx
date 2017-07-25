import * as React from 'react';
import { TilesListPage } from 'office-ui-fabric-react/lib/components/TilesList/TilesListPage';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { ComponentPage } from '../../components/ComponentPage/ComponentPage';

export class TilesListComponentPage extends React.Component<{}, {}> {
  public render() {
    return (
      <div ref='pageElement'>
        <ComponentPage>
          <PageHeader pageTitle='TilesList' backgroundColor='#038387'
            links={
              [
                {
                  'text': 'Overview',
                  'location': 'Overview'
                },
                {
                  'text': 'Variants',
                  'location': 'Variants'
                },
                {
                  'text': 'Implementation',
                  'location': 'Implementation'
                }
              ]
            } />
          <TilesListPage isHeaderVisible={ false } />
        </ComponentPage>
      </div>
    );
  }
}
