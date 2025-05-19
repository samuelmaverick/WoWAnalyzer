import { formatNumber } from 'common/format';
import Icon from 'interface/Icon';
import SpellLink from 'interface/SpellLink';
import Tooltip, { TooltipElement } from 'interface/Tooltip';
import PropTypes from 'prop-types';
import { Component } from 'react';

export const MITIGATED_NONE = 0;
export const MITIGATED_MAGICAL = 1;
export const MITIGATED_PHYSICAL = 2;
export const MITIGATED_UNKNOWN = 99;

class DamageTakenTable extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    spec: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
  };

  render() {
    const specClassName = this.props.spec.className.replace(' ', '');
    const row = (abilityData) => {
      const { ability, totalDmg, largestSpike } = abilityData;
      return (
        <tr key={ability.guid}>
          <td>
            <Tooltip
              content={`Total Damage Taken: ${formatNumber(totalDmg)} of ${formatNumber(
                this.props.total,
              )}.`}
            >
              <div className="flex performance-bar-container">
                <div
                  className={`flex-sub performance-bar ${specClassName}-bg`}
                  style={{ width: `${((totalDmg - largestSpike) / this.props.total) * 100}%` }}
                />
                <div
                  className="flex-sub performance-bar Hunter-bg"
                  style={{ width: `${(largestSpike / this.props.total) * 100}%`, opacity: 0.4 }}
                />
              </div>
            </Tooltip>
          </td>
          <td>
            <SpellLink spell={ability.guid} icon={false}>
              <Icon icon={ability.abilityIcon} alt={ability.name} /> {ability.name}
            </SpellLink>
          </td>
          <td>{formatNumber(totalDmg)}</td>
          <td>{formatNumber(largestSpike)}</td>
        </tr>
      );
    };

    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <TooltipElement content="Damage mitigated by stats &amp; abilities that reduce or absorb Physical damage, such as armor, Death Knights' Blood Shield, and Demon Hunters' Demon Spikes.">
                  <strong>Physical</strong>
                </TooltipElement>
              </th>
              <th>Ability</th>
              <th>Total Damage Taken</th>
              <th>Largest Spike</th>
            </tr>
          </thead>
          <tbody>
            {this.props.data
              .filter((abilityData) => abilityData.mitigatedAs === MITIGATED_PHYSICAL)
              .map(row)}
          </tbody>
          <thead>
            <tr>
              <th>
                <TooltipElement content="Damage mitigated by stats &amp; abilities that reduce or absorb Magical damage, such as Paladins' Blessing of Spellwarding, Brewmasters' Stagger (especially with Mystic Vitality), and Demon Hunters' Empower Wards.">
                  <b>Magical</b>
                </TooltipElement>
              </th>
              <th>Ability</th>
              <th>Total Damage Taken</th>
              <th>Largest Spike</th>
            </tr>
          </thead>
          <tbody>
            {this.props.data
              .filter((abilityData) => abilityData.mitigatedAs === MITIGATED_MAGICAL)
              .map(row)}
          </tbody>
        </table>
      </div>
    );
  }
}

export default DamageTakenTable;
