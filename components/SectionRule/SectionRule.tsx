import classes from './SectionRule.module.css';

/** The hairline between two sections of the home page, a watch hand at each end. */
export function SectionRule() {
  return <div className={classes.rule} aria-hidden="true" />;
}
